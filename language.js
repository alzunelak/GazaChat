// language.js
let translations = {};
let currentLang = "en";

// Load translations
fetch("translations.json")
  .then(res => res.json())
  .then(data => {
    translations = data;

    // Check localStorage for selected language
    const savedLang = localStorage.getItem("lang");
    currentLang = savedLang && translations[savedLang] ? savedLang : "en";

    // Set dropdown if exists
    const langSelect = document.getElementById("language");
    if (langSelect) langSelect.value = currentLang;

    // Apply translations
    applyTranslations();
  })
  .catch(err => console.error("Error loading translations:", err));

document.addEventListener("change", e => {
  if (e.target.id === "language") {
    currentLang = e.target.value;
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  }
});

function applyTranslations() {
  if (!translations[currentLang]) return;

  for (const key in translations[currentLang]) {
    const el = document.getElementById(key);
    if (el) el.textContent = translations[currentLang][key];
  }

  // Right-to-left support
  document.body.style.direction = (currentLang === "ar" || currentLang === "ur") ? "rtl" : "ltr";
}
