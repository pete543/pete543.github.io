const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-nav]");

if (navToggle && siteNav) {
  const closeNav = () => {
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll(`[data-page-link="${currentPage}"]`).forEach((link) => {
    link.setAttribute("aria-current", "page");
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll("[data-reveal]");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const demoClients = [
  {
    organization: "Silver State Health Network",
    contact: "Maya Reynolds",
    email: "maya.reynolds@silverstate.example",
    location: "Las Vegas, Nevada",
    service: "SDLC Leadership",
    phase: "Implementation",
    milestone: "Pilot readiness review",
    status: "Active"
  },
  {
    organization: "DesertLine Logistics",
    contact: "Andre Collins",
    email: "andre.collins@desertline.example",
    location: "Phoenix, Arizona",
    service: "System Integration",
    phase: "Discovery",
    milestone: "Interface inventory",
    status: "Discovery"
  },
  {
    organization: "Maple North Systems",
    contact: "Priya Desai",
    email: "priya.desai@maplenorth.example",
    location: "Toronto, Canada",
    service: "Usability Audit",
    phase: "Evaluation",
    milestone: "Findings workshop",
    status: "Active"
  },
  {
    organization: "Albion Civic Technology",
    contact: "Oliver Grant",
    email: "oliver.grant@albioncivic.example",
    location: "London, England",
    service: "SDLC Leadership",
    phase: "Deployment",
    milestone: "Go-live retrospective",
    status: "Closing"
  },
  {
    organization: "RhineWorks Manufacturing",
    contact: "Lena Fischer",
    email: "lena.fischer@rhineworks.example",
    location: "Berlin, Germany",
    service: "System Integration",
    phase: "Planning",
    milestone: "Data mapping approval",
    status: "Active"
  },
  {
    organization: "Southern Cross Utilities",
    contact: "Noah Bennett",
    email: "noah.bennett@southerncross.example",
    location: "Sydney, Australia",
    service: "Usability Audit",
    phase: "Discovery",
    milestone: "Research plan sign-off",
    status: "Discovery"
  }
];

const portalEntry = document.querySelector("[data-portal-entry]");
const portalWorkspace = document.querySelector("[data-portal-workspace]");
const portalOpen = document.querySelector("[data-portal-open]");
const portalLogout = document.querySelector("[data-portal-logout]");
const clientList = document.querySelector("[data-client-list]");
const clientSearch = document.querySelector("[data-client-search]");
const clientFilter = document.querySelector("[data-client-filter]");
const portalStorageKey = "pcp-demo-unlocked";

const statusClass = (status) => `status-${status.toLowerCase()}`;

const renderClients = () => {
  if (!clientList) return;
  const query = (clientSearch?.value || "").trim().toLowerCase();
  const filter = clientFilter?.value || "All";
  const matches = demoClients.filter((client) => {
    const searchable = Object.values(client).join(" ").toLowerCase();
    return searchable.includes(query) && (filter === "All" || client.status === filter);
  });

  if (!matches.length) {
    clientList.innerHTML =
      '<p class="empty-state">No fictional client records match those filters.</p>';
    return;
  }

  clientList.innerHTML = matches
    .map(
      (client) => `
        <article class="client-card">
          <div class="client-card-head">
            <div>
              <h3>${client.organization}</h3>
              <span>${client.location}</span>
            </div>
            <span class="status ${statusClass(client.status)}">${client.status}</span>
          </div>
          <dl>
            <dt>Contact</dt><dd>${client.contact}</dd>
            <dt>Email</dt><dd><a href="mailto:${client.email}">${client.email}</a></dd>
            <dt>Engagement</dt><dd>${client.service}</dd>
            <dt>Phase</dt><dd>${client.phase}</dd>
            <dt>Next milestone</dt><dd>${client.milestone}</dd>
          </dl>
        </article>`
    )
    .join("");
};

const setPortalState = (isOpen) => {
  if (!portalEntry || !portalWorkspace) return;
  portalEntry.hidden = isOpen;
  portalWorkspace.hidden = !isOpen;
  if (portalLogout) portalLogout.hidden = !isOpen;
  if (isOpen) {
    renderClients();
    clientSearch?.focus();
  } else {
    portalOpen?.focus();
  }
};

if (portalEntry && portalWorkspace) {
  setPortalState(sessionStorage.getItem(portalStorageKey) === "true");
  portalOpen?.addEventListener("click", () => {
    sessionStorage.setItem(portalStorageKey, "true");
    setPortalState(true);
  });
  portalLogout?.addEventListener("click", () => {
    sessionStorage.removeItem(portalStorageKey);
    if (clientSearch) clientSearch.value = "";
    if (clientFilter) clientFilter.value = "All";
    setPortalState(false);
  });
  clientSearch?.addEventListener("input", renderClients);
  clientFilter?.addEventListener("change", renderClients);
}

const contactForm = document.querySelector("[data-contact-form]");
const contactSuccess = document.querySelector("[data-contact-success]");
if (contactForm && contactSuccess) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    contactForm.reset();
    contactSuccess.hidden = false;
    contactSuccess.focus();
  });
}
