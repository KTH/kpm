import React from "react";

export function Page({ children }: { children: any }) {
  return (
    <div className="KTHPage">
      <header className="KTHPageHeader">
        <div className="row">
          <figure className="mainLogo">
            <a href="/"><img loading="lazy" src="https://www.kth.se/polopoly_fs/1.77257.1630589847!/KTH_Logotyp_RGB_2013-2.svg" alt="Till KTH:s startsida" /></a>
          </figure>
        </div>
        <div className="gradientBorder"></div>
      </header>
      <main className="content">{children}</main>
      <footer className="KTHPageFooter"></footer>
    </div>
  )
}