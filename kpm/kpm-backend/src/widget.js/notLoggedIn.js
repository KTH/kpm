(function (js, css, url) {
  let RS = /^https?:\/\/(www\.)?kth.se\/student($|\/)/;
  let RE = /^https?:\/\/(www\.)?kth.se\/(?!student($|\/))/;
  let RI = /^https?:\/\/intra\.kth\.se/;
  let lang = document.documentElement.lang.startsWith("sv") ? "sv" : "en";
  let links = [
    {
      href: "https://kth.se",
      label: { en: "kth.se", sv: "kth.se" },
      test: (url) => RE.test(url),
    },
    {
      href: "https://kth.se/student",
      label: { en: "Student web", sv: "Studentwebben" },
      test: (url) => RS.test(url),
    },
    {
      href: "https://intra.kth.se",
      label: { en: "Intranet", sv: "Intranät" },
      test: (url) => RI.test(url),
    },
  ];
  let lbls = {
    w: { en: "Websites", sv: "Webbplatser" },
    l: { en: "Login", sv: "Logga in" },
  };

  document.body.style.setProperty("--kpm-bar-height", "calc(2.5rem + 1px)");
  let cr = (t) => document.createElement(t);
  let st = cr("link");
  st.rel = "stylesheet";
  st.href = css;
  document.head.appendChild(st);

  let n = cr("div");
  n.id = "kpm-6cf53";
  n.classList.add("kth-kpm");
  let s = n.style;
  s.pointerEvents = "all";
  s.inset = "0";
  s.position = "fixed";
  s.display = "flex";
  s.alignItems = "center";
  s.height = "calc(2em + 1px)";
  s.padding = "0 1rem";
  s.justifyContent = "center";
  s.margin = "0 auto";
  s.backgroundColor = "#65656c";
  s.borderBottom = "solid 1px var(--kpmPaneBg, #fff)";

  let lis = links
    .map((link) => {
      let c = link.test(window.location.toString())
        ? "aria-current='true'"
        : "";

      return `<li><a href=${link.href} ${current} class="kth-menu-item">${link.label[lang]}</a></li>`;
    })
    .join("");

  let login = `<a class="kth-menu-item" style="margin-inline-start: auto" href="${url}?nextUrl=${location.href}">${lbls.l[lang]}</a>`;

  n.innerHTML = `
    <div class="kth-kpm__container" style="gap: 1rem; overflow-x: auto">
    <nav class="kth-entrances" aria-label="${lbls.w[language]}">
    <ul>${lis}</ul>
    </nav>
    ${login}
  `;

  let ne = cr("div");
  ne.classList.add("kth-kpm__container");
  document.body.classList.add("use-personal-menu");
  document.body.prepend(n);
})("{{JS_ASSET}}", "{{CSS_ASSET}}", "{{LOGIN_URL}}");
