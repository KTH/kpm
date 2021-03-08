export default function studies() {
  const el = document.getElementById("studies");
  console.log("Studies panels JS loaded");
  const navigation = el.getElementsByClassName("course-nav")[0].children;

  function onClick(e) {
    const { id } = e.target.dataset;
    if (id === "misc") {
      return;
    }
    e.target.classList.add("active");
    const sections = document.getElementsByTagName("section");
    for (const section of sections) {
      section.style.display = "none";
    }
    document.getElementById(id).style.display = "block";
    for (const nav of navigation) {
      nav.firstElementChild.classList.remove("active");
    }
    e.target.classList.add("active");
  }
  for (const nav of navigation) {
    nav.firstElementChild.addEventListener("click", onClick);
  }
}
