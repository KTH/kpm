(function (js, css) {
  var cr = (t) => document.createElement(t),
    ap = (n) => document.head.appendChild(n);

  // Create "<div id='kpm-6cf53' class='kth-kpm'>"
  let root = document.querySelector(".kth-kpm");

  if (!root) {
    root = cr("div");
    document.body.style.setProperty("--kpm-bar-height", "2.5rem");
    document.body.prepend(root);
    document.body.classList.add("use-personal-menu");
  }

  root.style.position = "fixed";
  root.id = "kpm-6cf53";
  let sc = cr("script");
  sc.defer = true;
  sc.src = js;
  ap(sc);
  let st = cr("link");
  st.rel = "stylesheet";
  st.href = css;
  ap(st);

  // NOTE: This global variable is read in kpm-backend/src/panes/utils.ts
  window.__kpmPublicUriBase__ = "{{KPM_PUBLIC_URI_BASE}}";
  // Inject some user data to allow rendering the menu properly.
  window.__kpmCurrentUser__ = "{{KPM_CURRENT_USER}}";
  window.__kpmSettings__ = "{{KPM_SETTINGS}}";
})("{{JS_ASSET}}", "{{CSS_ASSET}}");
