(function () {
  "use strict";

  const STORAGE_KEY = "dentalflow-demo-v1";
  const DEMO_DATE = "2026-10-26";

  const initialAppointments = [
    {
      id: "demo-1",
      name: "Andreea Popescu",
      clinic: "centru",
      service: "Consultație implantologie",
      time: "09:00",
      date: DEMO_DATE,
      status: "Confirmată"
    },
    {
      id: "demo-2",
      name: "Mihai Ionescu",
      clinic: "nord",
      service: "Igienizare profesională",
      time: "10:30",
      date: DEMO_DATE,
      status: "Confirmată"
    },
    {
      id: "demo-3",
      name: "Elena Dumitru",
      clinic: "cluj",
      service: "Control ortodonție",
      time: "12:00",
      date: DEMO_DATE,
      status: "De confirmat"
    },
    {
      id: "demo-4",
      name: "Vlad Marinescu",
      clinic: "centru",
      service: "Tratament endodontic",
      time: "14:15",
      date: DEMO_DATE,
      status: "Confirmată"
    },
    {
      id: "demo-5",
      name: "Ioana Pavel",
      clinic: "nord",
      service: "Consultație pediatrică",
      time: "16:00",
      date: DEMO_DATE,
      status: "De confirmat"
    }
  ];

  const clinicNames = {
    all: "Toate clinicile",
    centru: "Clinica Centru",
    nord: "Clinica Nord",
    cluj: "Clinica Cluj"
  };

  const phoneViews = {
    appointments: {
      eyebrow: "Următoarea programare",
      title: "Consultație implantologie",
      lines: ["Luni, 26 octombrie · 09:00", "Clinica Centru · Dr. Ana Marinescu", "Confirmată"]
    },
    treatment: {
      eyebrow: "Plan de tratament",
      title: "Reabilitare orală",
      lines: ["3 din 5 etape finalizate", "Următorul pas: coroana definitivă", "Progres actualizat de echipa medicală"]
    },
    payments: {
      eyebrow: "Situație financiară",
      title: "Plăți și documente",
      lines: ["Ultima plată: 1.250 lei", "Sold plan: 2.400 lei", "Facturile rămân disponibile în aplicație"]
    },
    files: {
      eyebrow: "Dosar medical",
      title: "Documentele tale",
      lines: ["Radiografie panoramică · 14 oct.", "Plan de tratament · versiunea 2", "Consimțăminte · 3 documente"]
    }
  };

  function readState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.appointments)) {
        return {
          appointments: saved.appointments,
          phoneTab: phoneViews[saved.phoneTab] ? saved.phoneTab : "appointments"
        };
      }
    } catch (_error) {
      // The demo remains usable when storage is unavailable or contains invalid data.
    }
    return { appointments: initialAppointments.slice(), phoneTab: "appointments" };
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_error) {
      // Local persistence is an enhancement; interactions still work without it.
      return false;
    }
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function makeElement(tagName, className, textValue) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof textValue === "string") element.textContent = textValue;
    return element;
  }

  function init() {
    const state = readState();
    let selectedClinic = "all";

    const clinicLabel = document.querySelector("#clinic-label");
    const scheduleList = document.querySelector("#schedule-list");
    const searchInput = document.querySelector("#schedule-search");
    const toast = document.querySelector("#demo-toast");

    function announce(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("show", "is-visible");
      window.clearTimeout(announce.timeoutId);
      announce.timeoutId = window.setTimeout(function () {
        toast.classList.remove("show", "is-visible");
      }, 3200);
    }

    function renderSchedule() {
      if (!scheduleList) return;
      const query = searchInput ? searchInput.value.trim().toLocaleLowerCase("ro-RO") : "";
      const visible = state.appointments.filter(function (appointment) {
        const matchesClinic = selectedClinic === "all" || appointment.clinic === selectedClinic;
        const searchable = [
          appointment.name,
          appointment.service,
          clinicNames[appointment.clinic] || appointment.clinic,
          appointment.status
        ].join(" ").toLocaleLowerCase("ro-RO");
        return matchesClinic && (!query || searchable.includes(query));
      }).sort(function (left, right) {
        return (String(left.date) + "T" + String(left.time)).localeCompare(String(right.date) + "T" + String(right.time));
      });

      scheduleList.replaceChildren();
      visible.forEach(function (appointment) {
        const item = makeElement("article", "appointment");
        const time = makeElement("div", "appointment-time", appointment.time);
        const details = makeElement("div", "appointment-details");
        const person = makeElement("strong", "appointment-person", appointment.name);
        const service = makeElement("span", "appointment-service", appointment.service);
        const clinic = makeElement("span", "appointment-clinic", clinicNames[appointment.clinic] || appointment.clinic);
        const date = makeElement("span", "appointment-date", new Intl.DateTimeFormat("ro-RO", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }).format(new Date(String(appointment.date) + "T12:00:00")));
        const status = makeElement("span", "appointment-status", appointment.status);

        status.dataset.status = appointment.status === "Confirmată" ? "confirmed" : "pending";
        details.append(person, service, date, clinic);
        item.append(time, details, status);
        scheduleList.append(item);
      });

      if (!visible.length) {
        scheduleList.append(makeElement("p", "appointment-empty", "Nu am găsit programări pentru selecția curentă."));
      }
      document.querySelectorAll(".side-count").forEach(function (counter) {
        counter.textContent = String(visible.length);
      });
    }

    document.querySelectorAll("[data-clinic]").forEach(function (button) {
      button.addEventListener("click", function () {
        const nextClinic = button.dataset.clinic;
        if (!clinicNames[nextClinic]) return;
        selectedClinic = nextClinic;
        document.querySelectorAll("[data-clinic]").forEach(function (candidate) {
          const active = candidate === button;
          candidate.classList.toggle("active", active);
          candidate.classList.toggle("is-active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
        setText(clinicLabel, clinicNames[nextClinic]);
        renderSchedule();
      });
    });

    if (searchInput) searchInput.addEventListener("input", renderSchedule);
    setText(clinicLabel, clinicNames[selectedClinic]);
    renderSchedule();

    const dialog = document.querySelector("#appointment-dialog");
    const form = document.querySelector("#appointment-form");
    const dateField = form ? form.elements.namedItem("date") : null;
    if (dateField && !dateField.value) dateField.value = DEMO_DATE;

    function openDialog() {
      if (!dialog) return;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else {
        dialog.hidden = false;
        dialog.setAttribute("open", "");
      }
      const nameField = form ? form.elements.namedItem("name") : null;
      if (nameField && typeof nameField.focus === "function") nameField.focus();
    }

    function closeDialog() {
      if (!dialog) return;
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else {
        dialog.hidden = true;
        dialog.removeAttribute("open");
      }
    }

    const newAppointmentButton = document.querySelector("#new-appointment");
    if (newAppointmentButton) newAppointmentButton.addEventListener("click", openDialog);
    const closeDialogButton = document.querySelector("#close-dialog");
    if (closeDialogButton) closeDialogButton.addEventListener("click", closeDialog);

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(form);
        const nameField = form.elements.namedItem("name");
        const patientName = String(data.get("name") || "").trim();
        if (!patientName) {
          if (nameField && typeof nameField.setCustomValidity === "function") {
            nameField.setCustomValidity("Introduceți numele pacientului.");
            nameField.reportValidity();
          }
          return;
        }
        if (nameField && typeof nameField.setCustomValidity === "function") nameField.setCustomValidity("");
        const appointment = {
          id: "local-" + Date.now(),
          name: patientName,
          clinic: clinicNames[String(data.get("clinic"))] ? String(data.get("clinic")) : "centru",
          service: String(data.get("service") || "Consultație").trim(),
          time: String(data.get("time") || "09:00"),
          date: String(data.get("date") || DEMO_DATE),
          status: "De confirmat"
        };
        state.appointments.push(appointment);
        const persisted = saveState(state);
        form.reset();
        if (dateField) dateField.value = DEMO_DATE;
        selectedClinic = "all";
        document.querySelectorAll("[data-clinic]").forEach(function (candidate) {
          const active = candidate.dataset.clinic === "all";
          candidate.classList.toggle("active", active);
          candidate.classList.toggle("is-active", active);
          candidate.setAttribute("aria-pressed", String(active));
        });
        setText(clinicLabel, clinicNames.all);
        if (searchInput) searchInput.value = "";
        renderSchedule();
        closeDialog();
        announce(persisted
          ? "Programarea demo a fost salvată local. Nicio acțiune externă nu a fost trimisă."
          : "Programarea apare în această sesiune, dar stocarea locală nu este disponibilă.");
      });
    }

    const messagePreview = document.querySelector("#message-preview");
    const messageStatus = document.querySelector("#message-status");
    if (messagePreview) {
      messagePreview.addEventListener("click", function () {
        setText(messageStatus, "Simulare: mesaj pregătit pentru pacient. Niciun SMS expediat.");
        announce("Previzualizarea mesajului este gata. Niciun SMS expediat.");
      });
    }

    const phoneContent = document.querySelector("#phone-content");
    function renderPhoneView(tabName) {
      const view = phoneViews[tabName] || phoneViews.appointments;
      state.phoneTab = phoneViews[tabName] ? tabName : "appointments";
      saveState(state);
      document.querySelectorAll("[data-phone]").forEach(function (button) {
        const active = button.dataset.phone === state.phoneTab;
        button.classList.toggle("active", active);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.setAttribute("aria-pressed", String(active));
      });
      if (!phoneContent) return;
      const card = makeElement("div", "phone-card");
      card.append(makeElement("span", "phone-eyebrow", view.eyebrow));
      card.append(makeElement("h4", "phone-title", view.title));
      const list = makeElement("ul", "phone-details");
      view.lines.forEach(function (line) {
        list.append(makeElement("li", "phone-detail", line));
      });
      card.append(list);
      phoneContent.replaceChildren(card);
    }

    document.querySelectorAll("[data-phone]").forEach(function (button) {
      button.addEventListener("click", function () {
        renderPhoneView(button.dataset.phone);
      });
    });
    renderPhoneView(state.phoneTab);

    const slides = Array.from(document.querySelectorAll("[data-slide]"));
    const slideCount = document.querySelector("#slide-count");
    let currentSlide = Math.max(0, slides.findIndex(function (slide) {
      return slide.id === "overview";
    }));

    function updatePresentation(scroll) {
      slides.forEach(function (slide, index) {
        const active = index === currentSlide;
        slide.classList.toggle("is-active", active);
        slide.classList.toggle("active", active);
        slide.removeAttribute("aria-hidden");
      });
      setText(slideCount, slides.length ? (currentSlide + 1) + " / " + slides.length : "0 / 0");
      if (scroll && slides[currentSlide]) slides[currentSlide].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function moveSlide(delta) {
      if (!slides.length) return;
      currentSlide = (currentSlide + delta + slides.length) % slides.length;
      updatePresentation(true);
    }

    function togglePresentation(force) {
      const next = typeof force === "boolean" ? force : !document.body.classList.contains("presenting");
      document.body.classList.toggle("presenting", next);
      if (next) {
        const overviewIndex = slides.findIndex(function (slide) { return slide.id === "overview"; });
        currentSlide = overviewIndex >= 0 ? overviewIndex : 0;
      }
      updatePresentation(next);
    }

    document.querySelectorAll("[data-present]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        togglePresentation();
      });
    });
    const previousButton = document.querySelector("#prev-slide");
    if (previousButton) previousButton.addEventListener("click", function () { moveSlide(-1); });
    const nextButton = document.querySelector("#next-slide");
    if (nextButton) nextButton.addEventListener("click", function () { moveSlide(1); });
    updatePresentation(false);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("presenting")) {
        togglePresentation(false);
        return;
      }
      if (!document.body.classList.contains("presenting")) return;
      const tagName = event.target && event.target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveSlide(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveSlide(1);
      }
    });

    const printButton = document.querySelector("#print");
    if (printButton) printButton.addEventListener("click", function () { window.print(); });

    const menuButton = document.querySelector("#mobile-menu");
    const navLinks = document.querySelector("#nav-links");
    if (menuButton && navLinks) {
      menuButton.addEventListener("click", function () {
        const expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        navLinks.classList.toggle("is-open", !expanded);
      });
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menuButton.setAttribute("aria-expanded", "false");
          navLinks.classList.remove("is-open");
        });
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
