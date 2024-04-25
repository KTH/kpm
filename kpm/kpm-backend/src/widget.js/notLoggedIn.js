(function (js, css, url) {
  let RS = /^https?:\/\/(www\.)?kth.se\/(en\/)?student($|\/)/;
  let RE = /^https?:\/\/(www\.)?kth.se($|\/)/;
  let RI = /^https?:\/\/intra\.kth\.se/;
  let lang = document.documentElement.lang.startsWith("sv") ? "sv" : "en";
  let links = {
    external: {
      href: { sv: "https://www.kth.se", en: "https://www.kth.se/en" },
      label: { en: "kth.se", sv: "kth.se" },
    },
    student: {
      href: {
        sv: "https://www.kth.se/student",
        en: "https://www.kth.se/en/student",
      },
      label: { en: "Student web", sv: "Studentwebben" },
    },
    intra: {
      href: { sv: "https://intra.kth.se", en: "https://intra.kth.se/en" },
      label: { en: "Intranet", sv: "Intranät" },
    },
  };
  let lbls = {
    w: { en: "Websites", sv: "Webbplatser" },
    l: { en: "Login", sv: "Logga in" },
  };

  let cr = (t) => document.createElement(t);
  let root = document.querySelector(".kth-kpm");
  if (!root) {
    // <div id="kpm-6cf53" style="pointer-events: all"...>
    root = cr("div");
    root.classList.add("kth-kpm");
    document.body.style.setProperty("--kpm-bar-height", "2.5rem");
    document.body.classList.add("use-personal-menu");
    document.body.prepend(root);
  }

  root.id = "kpm-6cf53";
  let st = cr("link");
  st.rel = "stylesheet";
  st.href = css;
  document.head.appendChild(st);

  let s = root.style;
  s.pointerEvents = "all";
  s.inset = "0";
  s.position = "fixed";
  s.height = "2.5rem";

  const l = window.location.toString();
  let current = "";

  // Note: "student" must be checked before "external"
  if (RS.test(l)) {
    current = "student";
  } else if (RI.test(l)) {
    current = "intra";
  } else if (RE.test(l)) {
    current = "external";
  }

  let keys = ["external", "student", "intra"];

  let lis = keys
    .map((key) => {
      let c = key === current ? "aria-current='true'" : "";
      let link = links[key];

      return `<li><a href=${link.href[lang]} ${c} class="kth-menu-item">${link.label[lang]}</a></li>`;
    })
    .join("");

  let lis2 = keys
    .map((key) => {
      let link = links[key];
      return `<li><a href=${link.href[lang]}>${link.label[lang]}</a></li>`;
    })
    .join("");

  let login = `<a class="kth-menu-item kpm-login" href="${url}?nextUrl=${location.href}">${lbls.l[lang]}</a>`;

  let currentLabel =
    current === "" ? links.external.label[lang] : links[current].label[lang];

  root.innerHTML = `
    <div class="kth-kpm__container kpm-logged-out">
    <nav class="kth-entrances-expandable kpm-entrances-expandable" aria-label="${lbls.w[lang]}">
    <button class="kth-menu-item dropdown" aria-expanded="false" aria-controls="kpm-6cf53-entrances">${currentLabel}</button>
    <div class="kpm-mini-dialog" id="kpm-6cf53-entrances"><ul>${lis2}</ul></div>
    </nav>
    <nav class="kpm-entrances kth-entrances" aria-label="${lbls.w[lang]}">
    <ul>${lis}</ul>
    </nav>
    ${login}
    </div>
  `;

  let btn = document.querySelector(
    "button[aria-controls='kpm-6cf53-entrances']"
  );
  btn.addEventListener("click", () => {
    btn.ariaExpanded = btn.ariaExpanded === "false" ? "true" : "false";
  });
})("{{JS_ASSET}}", "{{CSS_ASSET}}", "{{LOGIN_URL}}");
