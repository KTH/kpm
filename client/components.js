export function tabGroup(element) {
  const contentList = element.getElementsByClassName("tabs-current-tab")[0]
    .children;

  const linkList = element
    .getElementsByClassName("tabs-navigation")[0]
    .getElementsByTagName("a");

  function updateTabs() {
    const openedTab = element.dataset.openedTab;

    for (const link of linkList) {
      if (link.dataset.id === openedTab) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }

    for (const content of contentList) {
      if (content.dataset.id === openedTab) {
        content.style.display = "block";
      } else {
        content.style.display = "none";
      }
    }
  }

  updateTabs();

  for (const link of linkList) {
    link.addEventListener("click", () => {
      element.dataset.openedTab = link.dataset.id;

      updateTabs(element);
    });
  }
}
