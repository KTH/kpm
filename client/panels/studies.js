export default function studies() {
  const el = document.getElementById("studies");
  console.log("Studies panels JS loaded");
  const navigation = el.getElementsByClassName("course-nav")[0].children;

  function onClick(e) {
    if (e.target.dataset.id === "misc") {
      return;
    }
    console.log(e.target.dataset.id);
    const sections = document.getElementsByTagName("section");
    for (const section of sections) {
      section.style.display = "none";
    }
    document.getElementById(e.target.dataset.id).style.display = "block";
  }
  for (const nav of navigation) {
    nav.firstElementChild.addEventListener("click", onClick);
  }
}
