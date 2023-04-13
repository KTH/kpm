import React from "react";
import { i18n } from "./i18n";

export function Page({
  id = undefined,
  lang = "sv",
  children,
}: {
  id?: string;
  lang?: string;
  children: any;
}) {
  const pageId = id;
  return (
    <div className="KTHPage">
      <KTHHeader lang={lang} />
      <div id="kpm-activation" className="container main">
        <KTHBreadCrumbs
          path={[
            ["https://www.kth.se", "KTH"],
            ["/kpm", "KPM Beta"],
          ]}
        />
        <main id={pageId} className="">
          <article id="mainContent" className="mainContent">
            {children}
          </article>
        </main>
      </div>
      <KTHFooter lang={lang} />
    </div>
  );
}

type TKTHBreadCrumbs = { path: [href: string, title: string][] };
function KTHBreadCrumbs({ path }: TKTHBreadCrumbs) {
  return (
    <div className="container articleNavigation">
      <nav id="breadcrumbs" aria-label="Brödsmulor">
        <ol className="breadcrumb">
          {path.map(([href, label]) => (
            <li key={href} className="breadcrumb-item">
              <a href={href}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function KTHHeader({ lang = "sv" }) {
  return (
    <header className="KTHPageHeader">
      <div className="container-fluid">
        <div className="container">
          <div className="header-container__top">
            <figure className="block figure defaultTheme mainLogo">
              <a href="https://www.kth.se/">
                <img
                  loading="lazy"
                  src="https://www.kth.se/polopoly_fs/1.77257.1630589847!/KTH_Logotyp_RGB_2013-2.svg"
                  alt="Till KTH:s startsida"
                />
              </a>
            </figure>
            <div className="block siteName">Beta</div>
            <div
              className="block list links secondaryMenu"
              lang={i18n(lang, "sv-SE")}
            >
              <nav aria-label="Sekundär toppmeny">
                <ul>
                  <li>
                    <a href="https://www.kth.se/student">
                      {i18n(lang, "Student")}
                    </a>
                  </li>
                  <li>
                    <a href="https://www.kth.se/alumni">
                      {i18n(lang, "Alumn")}
                    </a>
                  </li>
                  <li>
                    <a href="https://intra.kth.se/">{i18n(lang, "Anställd")}</a>
                  </li>
                  <li>
                    <a
                      lang={lang === "en" ? "sv-SE" : "en-GB"}
                      href={`https://www.kth.se/${lang === "sv" ? "en" : ""}`}
                    >
                      {i18n(lang, "International website")}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="header-container__bottom">
            <nav
              aria-label="Primär toppmeny"
              className="block megaMenu navbar navbar-expand-lg navbar-light"
            >
              <span id="propertiesMegaMenu"></span>
              <div className="collapse navbar-collapse" id="megaMenuContent">
                <ul className="menu navbar-nav mr-auto" id="megaMenu">
                  <li
                    className="item nav-item megaItem homeItem"
                    data-content-id="1.863181"
                    data-id="id-8e28f4e2-f453-43c0-8914-653287645cdd"
                  >
                    <div className="headerItem showLabel">
                      <a className="nav-link" href="https://www.kth.se/">
                        {" "}
                        {i18n(lang, "Hem")}
                      </a>
                    </div>
                  </li>
                  <li
                    className="item nav-item megaItem"
                    data-content-id="1.1178021"
                    data-id="id-7e185ef7-579b-40ae-a27f-93bd3e8b894b"
                  >
                    <div className="headerItem">
                      <a
                        className="nav-link"
                        href="https://www.kth.se/utbildning"
                      >
                        {" "}
                        {i18n(lang, "Utbildning")}
                      </a>
                    </div>
                  </li>

                  <li
                    className="item nav-item megaItem"
                    data-content-id="1.202245"
                    data-id="id-20f5055c-d417-46a6-bdce-38c53d830398"
                  >
                    <div className="headerItem">
                      <a
                        className="nav-link"
                        href="https://www.kth.se/samverkan"
                      >
                        {" "}
                        {i18n(lang, "Samverkan")}
                      </a>
                    </div>
                  </li>
                  <li
                    className="item nav-item megaItem"
                    data-content-id="1.863186"
                    data-id="id-cee66f5c-a5a0-496e-b8f3-49170868d42b"
                  >
                    <div className="headerItem">
                      <a className="nav-link" href="https://www.kth.se/om">
                        {" "}
                        {i18n(lang, "Om KTH")}
                      </a>
                    </div>
                  </li>
                  <li
                    className="item nav-item megaItem"
                    data-content-id="1.853601"
                    data-id="id-cbf032c6-6c37-4b30-8d54-3c467e79e6c9"
                  >
                    <div className="headerItem">
                      <a
                        className="nav-link"
                        href="https://www.kth.se/biblioteket"
                      >
                        {" "}
                        {i18n(lang, "Bibliotek")}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div id="gradientBorder"></div>
    </header>
  );
}

// TODO: Load this from cortina?  Provide sv an en version!
function KTHFooter({ lang = "sv" }) {
  return (
    <footer className="container">
      <div
        className="block columnSplitter row using4Columns"
        lang={i18n(lang, "sv-SE")}
      >
        <div className="col c1">
          <div
            className="block list links defaultTheme"
            lang={i18n(lang, "sv-SE")}
          >
            <h2>KTH</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/utbildning">
                  {i18n(lang, "Utbildning")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/forskning">
                  {i18n(lang, "Forskning")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/samverkan">
                  {i18n(lang, "Samverkan")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om">{i18n(lang, "Om KTH")}</a>
              </li>
              <li>
                <a href="https://www.kth.se/student">
                  {i18n(lang, "Student på KTH")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/alumni">{i18n(lang, "Alumni")}</a>
              </li>
              <li>
                <a href="https://intra.kth.se/">{i18n(lang, "KTH Intranät")}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c2">
          <div
            className="block list links defaultTheme"
            lang={i18n(lang, "sv-SE")}
          >
            <h2>{i18n(lang, "Organisation")}</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/biblioteket">
                  {i18n(lang, "KTH Biblioteket")}
                </a>
              </li>
              <li>
                <a href="https://intra.kth.se/styrning/kths-organisation/skolor/kth-s-skolor-1.3848">
                  {i18n(lang, "KTH:s skolor")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/rektor">
                  {i18n(lang, "Rektor")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/organisation/gvs-1.887371">
                  {i18n(lang, "Gemensamt verksamhetsstöd")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c3">
          <div
            className="block list links defaultTheme"
            lang={i18n(lang, "sv-SE")}
          >
            <h2>{i18n(lang, "Tjänster")}</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/student/studier/schema">
                  {i18n(lang, "Schema")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/social/">
                  {i18n(lang, "Kurs-, program- och gruppwebbar")}
                </a>
              </li>
              <li>
                <a href="https://canvas.kth.se">
                  {i18n(lang, "Lärplattformen Canvas")}
                </a>
              </li>
              <li>
                <a href="https://webmail.kth.se">{i18n(lang, "Webbmejl")}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c4">
          <article
            className="block teaser top white"
            lang={i18n(lang, "sv-SE")}
          >
            <div className="teaserBody">
              <h2 className="teaserHeading">{i18n(lang, "Kontakt")}</h2>
              <div className="lead">
                <p>
                  <strong>KTH</strong>
                  <br />{" "}
                  <em>
                    100 44 Stockholm
                    <br /> +46 8 790 60 00
                  </em>
                </p>
              </div>
            </div>
          </article>
          <div
            className="block list links defaultTheme"
            lang={i18n(lang, "sv-SE")}
          >
            <ul>
              <li>
                <a href="https://www.kth.se/om/kontakt">
                  {i18n(lang, "Kontakta KTH")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/work-at-kth?utm_source=footer&amp;utm_medium=web&amp;utm_campaign=jobb">
                  {i18n(lang, "Jobba på KTH")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/press?utm_source=footer&amp;utm_medium=web&amp;utm_campaign=press">
                  {i18n(lang, "Press och media")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/kontakt/faktura-och-betalning-1.2317">
                  {i18n(lang, "Faktura och betalning")}
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/KTHuniversitet/">
                  {i18n(lang, "KTH på Facebook")}
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/school/kth">
                  {i18n(lang, "KTH på Linkedin")}
                </a>
              </li>
              <li>
                <a href="https://twitter.com/KTHuniversity">
                  {i18n(lang, "KTH på Twitter")}
                </a>
              </li>
              <li>
                <a href="https://intra.kth.se/administration/kommunikation/webb/om/webbansvariga-1.23113">
                  {i18n(lang, "Kontakta webbansvarig")}
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/gemensamt">
                  {i18n(lang, "Om KTH:s webbplats")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div id="back-to-top" role="link" className="show">
        {i18n(lang, "Till sidans topp")}
      </div>
    </footer>
  );
}
