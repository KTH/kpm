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

  document.body.style.setProperty("--kpm-bar-height", "2.5rem");
  document.documentElement.style.setProperty("scrollbar-gutter", "stable");
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
  s.height = "2.5rem";

  const currentLink =
    links.find((l) => l.test(window.location.toString())) || links[0];

  let lis = links
    .map((link) => {
      let c = link.test(window.location.toString())
        ? "aria-current='true'"
        : "";

      return `<li><a href=${link.href} ${c} class="kth-menu-item">${link.label[lang]}</a></li>`;
    })
    .join("");

  let lis2 = links
    .map((link) => {
      return `<li><a href=${link.href}>${link.label[lang]}</a></li>`;
    })
    .join("");

  let login = `<a class="kth-menu-item kpm-login" href="${url}?nextUrl=${location.href}">${lbls.l[lang]}</a>`;

  n.innerHTML = `
    <div class="kth-kpm__container kpm-logged-out">
    <nav class="kpm-entrances-expandable" aria-label="${lbls.w[lang]}">
    <button class="kth-menu-item dropdown" aria-expanded="false" aria-controls="kpm-6cf53-entrances">${currentLink.label[lang]}</button>
    <div class="kpm-mini-dialog" id="kpm-6cf53-entrances"><ul>${lis2}</ul></div>
    </nav>
    <nav class="kpm-entrances kth-entrances" aria-label="${lbls.w[lang]}">
    <ul>${lis}</ul>
    </nav>
    ${login}
    </div>
  `;

  document.body.classList.add("use-personal-menu");
  document.body.prepend(n);
  let btn = document.querySelector(
    "button[aria-controls='kpm-6cf53-entrances']"
  );
  btn.addEventListener("click", () => {
    btn.ariaExpanded = btn.ariaExpanded === "false" ? "true" : "false";
  });
})("{{JS_ASSET}}", "{{CSS_ASSET}}", "{{LOGIN_URL}}");
