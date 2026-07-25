const fs = require("fs");
const path = require("path");

const root = process.cwd();
const sites = [
  {
    name: "PCP",
    directory: root,
    expectedPages: 10,
    requiredText: "Project Consultants Plus",
    forbiddenText: "One-Punch Anime Emporium"
  },
  {
    name: "One-Punch",
    directory: path.join(root, "one-punch"),
    expectedPages: 17,
    requiredText: "One-Punch Anime Emporium",
    forbiddenText: "Project Consultants Plus"
  }
];
const errors = [];

function localTarget(sourceFile, reference) {
  const cleanReference = reference.split(/[?#]/)[0];
  if (
    !cleanReference ||
    cleanReference.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(cleanReference)
  ) {
    return null;
  }
  if (cleanReference.startsWith("/")) {
    return { error: "uses a root-relative path" };
  }
  return { path: path.resolve(path.dirname(sourceFile), cleanReference) };
}

for (const site of sites) {
  const htmlFiles = fs
    .readdirSync(site.directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name);

  if (htmlFiles.length !== site.expectedPages) {
    errors.push(
      `${site.name}: expected ${site.expectedPages} HTML files, found ${htmlFiles.length}`
    );
  }

  const siteCorpus = htmlFiles
    .map((file) => fs.readFileSync(path.join(site.directory, file), "utf8"))
    .join("\n");

  if (site.name === "PCP") {
    const assignmentRequirements = [
      ["February 2015", "founding date"],
      ["Joanne Schmidt", "co-founder Joanne Schmidt"],
      ["Alexis Green", "co-founder Alexis Green"],
      ["20 consultants", "consultant count"],
      ["2</strong><span>Office staff", "office-staff count"],
      ["Project Management Institute", "PMI certification requirement"],
      ["https://www.pmi.org/certifications/", "PMI certification link"],
      ["100% service guarantee", "service guarantee"],
      ["SDLC", "SDLC services"],
      ["System Integration", "system-integration services"],
      ["Usability Testing", "usability-testing services"],
      ["Employee Portal", "employee lookup page"],
      ["Bring practical Project Management principles to bear on real-world IT business solutions", "mission statement"],
      ["<h2>Vision</h2>", "vision statement"]
    ];
    for (const [text, description] of assignmentRequirements) {
      if (!siteCorpus.includes(text)) errors.push(`PCP: missing assignment requirement (${description})`);
    }
  }

  for (const file of htmlFiles) {
    const fullPath = path.join(site.directory, file);
    const html = fs.readFileSync(fullPath, "utf8");
    const label = `${site.name}/${file}`;

    if (!/<html\s+lang="en"/i.test(html)) errors.push(`${label}: missing lang="en"`);
    if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${label}: missing title`);
    if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) {
      errors.push(`${label}: missing meta description`);
    }
    if (!/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i.test(html)) errors.push(`${label}: missing h1`);
    if (!html.includes(site.requiredText)) errors.push(`${label}: missing site brand`);
    if (html.includes(site.forbiddenText)) errors.push(`${label}: contains cross-site brand`);
    if (site.name === "PCP") {
      for (const heading of html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)) {
        if (heading[1].trim().endsWith(".")) {
          errors.push(`${label}: heading ends with a period "${heading[1].trim()}"`);
        }
      }
    }

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    for (const id of new Set(duplicateIds)) errors.push(`${label}: duplicate id "${id}"`);

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      const target = localTarget(fullPath, reference);
      if (!target) continue;
      if (target.error) {
        errors.push(`${label}: ${target.error} "${reference}"`);
      } else if (!fs.existsSync(target.path)) {
        errors.push(`${label}: missing local target "${reference}"`);
      }
    }

    for (const control of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
      const attributes = control[2];
      const type = attributes.match(/\stype="([^"]+)"/i)?.[1]?.toLowerCase() || "";
      if (["hidden", "submit", "button", "reset"].includes(type)) continue;
      const id = attributes.match(/\sid="([^"]+)"/i)?.[1];
      const beforeControl = html.slice(0, control.index);
      const insideLabel =
        beforeControl.toLowerCase().lastIndexOf("<label") >
        beforeControl.toLowerCase().lastIndexOf("</label>");
      const hasAriaLabel = /\saria-label="[^"]+"/i.test(attributes);
      if (!id && !insideLabel && !hasAriaLabel) {
        errors.push(`${label}: ${control[1].toLowerCase()} has no accessible label`);
      } else if (
        id &&
        !insideLabel &&
        !hasAriaLabel &&
        !new RegExp(`<label\\s+for="${id}"`, "i").test(html)
      ) {
        errors.push(`${label}: control "${id}" has no matching label`);
      }
    }
  }
}

if (errors.length) {
  console.error("Site validation failed:");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log(
  `Checked ${sites.reduce((total, site) => total + site.expectedPages, 0)} HTML files across PCP and One-Punch. All checks passed.`
);
