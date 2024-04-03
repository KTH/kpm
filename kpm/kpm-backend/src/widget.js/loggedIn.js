(function (js, css) {
  document.body.style.setProperty("--kpm-bar-height", "calc(2em + 1px)");
  var cr = (t) => document.createElement(t),
    ap = (n) => document.head.appendChild(n);
  let sc = cr("script");
  sc.defer = true;
  sc.src = js;
  ap(sc);
  let st = cr("link");
  st.rel = "stylesheet";
  st.href = css;
  ap(st);
  let n = cr("div");
  n.id = "kpm-6cf53";
  n.classList.add("kth-kpm");
  n.style.position = "fixed";
  document.body.classList.add("use-personal-menu");
  document.body.prepend(n);
  // NOTE: This global variable is read in kpm-backend/src/panes/utils.ts
  window.__kpmPublicUriBase__ = "{{KPM_PUBLIC_URI_BASE}}";
  // Inject some user data to allow rendering the menu properly.
  window.__kpmCurrentUser__ = "{{KPM_CURRENT_USER}}";
  window.__kpmSettings__ = "{{KPM_SETTINGS}}";
})("{{JS_ASSET}}", "{{CSS_ASSET}}");
