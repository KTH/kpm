const translations = {
  en: {
    loading: "Loading",
    menu: "Menu",
    login: "Log in",
  },
  sv: {
    loading: "Laddar",
    menu: "Meny",
    login: "Logga in",
  },
};

/**
 *
 * @param {string} input input you want to translate
 * @param {string} lang language you want to translate into
 * @returns {string}
 */

function intl(input, lang) {
  return translations[lang][input];
}

module.exports = intl;
