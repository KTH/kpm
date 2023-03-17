import React from "react";

export function Page({
  id = undefined,
  children,
}: {
  id?: string;
  children: any;
}) {
  const pageId = id;
  return (
    <div className="KTHPage">
      <KTHHeader />
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
      <KTHFooter />
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

function KTHHeader() {
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
            <div className="block list links secondaryMenu" lang="sv-SE">
              <nav aria-label="Sekundär toppmeny">
                <ul>
                  <li>
                    <a href="https://www.kth.se/student">Student</a>
                  </li>
                  <li>
                    <a href="https://www.kth.se/alumni">Alumn</a>
                  </li>
                  <li>
                    <a href="https://intra.kth.se/">Anställd</a>
                  </li>
                  <li>
                    <a lang="en-GB" href="https://www.kth.se/en">
                      International website
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
                        Hem
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
                        Utbildning
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
                        Samverkan
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
                        Om KTH
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
                        Bibliotek
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
function KTHFooter() {
  return (
    <footer className="container">
      <div className="block columnSplitter row using4Columns" lang="sv-SE">
        <div className="col c1">
          <div className="block list links defaultTheme" lang="sv-SE">
            <h2>KTH</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/utbildning">Utbildning</a>
              </li>
              <li>
                <a href="https://www.kth.se/forskning">Forskning</a>
              </li>
              <li>
                <a href="https://www.kth.se/samverkan">Samverkan</a>
              </li>
              <li>
                <a href="https://www.kth.se/om">Om KTH</a>
              </li>
              <li>
                <a href="https://www.kth.se/student">Student på KTH</a>
              </li>
              <li>
                <a href="https://www.kth.se/alumni">Alumni</a>
              </li>
              <li>
                <a href="https://intra.kth.se/">KTH Intranät</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c2">
          <div className="block list links defaultTheme" lang="sv-SE">
            <h2>Organisation</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/biblioteket">KTH Biblioteket</a>
              </li>
              <li>
                <a href="https://intra.kth.se/styrning/kths-organisation/skolor/kth-s-skolor-1.3848">
                  KTH:s skolor
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/rektor">Rektor</a>
              </li>
              <li>
                <a href="https://www.kth.se/om/organisation/gvs-1.887371">
                  Gemensamt verksamhetsstöd
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c3">
          <div className="block list links defaultTheme" lang="sv-SE">
            <h2>Tjänster</h2>

            <ul>
              <li>
                <a href="https://www.kth.se/student/studier/schema">Schema</a>
              </li>
              <li>
                <a href="https://www.kth.se/social/">
                  Kurs-, program- och gruppwebbar
                </a>
              </li>
              <li>
                <a href="https://canvas.kth.se">Lärplattformen Canvas</a>
              </li>
              <li>
                <a href="https://webmail.kth.se">Webbmejl</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col c4">
          <article className="block teaser top white" lang="sv-SE">
            <div className="teaserBody">
              <h2 className="teaserHeading">Kontakt</h2>
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
          <div className="block list links defaultTheme" lang="sv-SE">
            <ul>
              <li>
                <a href="https://www.kth.se/om/kontakt">Kontakta KTH</a>
              </li>
              <li>
                <a href="https://www.kth.se/om/work-at-kth?utm_source=footer&amp;utm_medium=web&amp;utm_campaign=jobb">
                  Jobba på KTH
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/press?utm_source=footer&amp;utm_medium=web&amp;utm_campaign=press">
                  Press och media
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/om/kontakt/faktura-och-betalning-1.2317">
                  Faktura och betalning
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/KTHuniversitet/">
                  KTH på Facebook
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/school/kth">
                  KTH på Linkedin
                </a>
              </li>
              <li>
                <a href="https://twitter.com/KTHuniversity">KTH på Twitter</a>
              </li>
              <li>
                <a href="https://intra.kth.se/administration/kommunikation/webb/om/webbansvariga-1.23113">
                  Kontakta webbansvarig
                </a>
              </li>
              <li>
                <a href="https://www.kth.se/gemensamt">Om KTH:s webbplats</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div id="back-to-top" role="link" className="show">
        Till sidans topp
      </div>
    </footer>
  );
}
