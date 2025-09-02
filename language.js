document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("language");
  const savedLang = localStorage.getItem("selectedLanguage") || "en";

  let translations = {};

  // Load the translations JSON
  fetch("translations.json")
    .then(response => response.json())
    .then(data => {
      translations = data;

      // Set initial language
      if (langSelect) langSelect.value = savedLang;
      applyLanguage(savedLang, data);
    })
    .catch(() => console.warn("Could not load translations."));

  // Update language when dropdown changes
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const selectedLang = langSelect.value;
      localStorage.setItem("selectedLanguage", selectedLang);
      applyLanguage(selectedLang, translations);
    });
  }

  function applyLanguage(lang, data) {
    document.documentElement.lang = lang;

    // --- Welcome Page ---
    if (data.welcome && document.getElementById("tagline")) {
      const t = data.welcome[lang] || {};
      document.getElementById("tagline").textContent = t.tagline || "";
      const privacyLink = document.getElementById("privacyLink");
      if (privacyLink) privacyLink.textContent = t.privacy || "";
      const getStarted = document.getElementById("getStarted");
      if (getStarted) getStarted.textContent = t.getStarted || "";
    }

    // --- Permissions Page ---
    if (data.permissions && document.getElementById("permissionsTitle")) {
      const p = data.permissions[lang] || {};
      document.getElementById("permissionsTitle").textContent = p.permissionsTitle || "";
      document.getElementById("permissionsSubtitle").textContent = p.permissionsSubtitle || "";
      document.getElementById("notificationTitle").textContent = p.notificationTitle || "";
      document.getElementById("notificationDesc").textContent = p.notificationDesc || "";
      document.getElementById("contactTitle").textContent = p.contactTitle || "";
      document.getElementById("contactDesc").textContent = p.contactDesc || "";
      document.getElementById("phoneTitle").textContent = p.phoneTitle || "";
      document.getElementById("phoneDesc").textContent = p.phoneDesc || "";
      document.getElementById("nextBtn").textContent = p.nextBtn || "";
      document.getElementById("allowBtn").textContent = p.allowBtn || "";
      document.getElementById("denyBtn").textContent = p.denyBtn || "";
    }

    // --- Add more pages here as needed ---
  }
});

