function showBootstrapModal(Title, Body) {
  const bootstrapModal = document.getElementById("bootstrapModal");

  let DOMTitle = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-header > h1"
  );
  let DOMBody = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-body"
  );
  let DOMFotter = document.querySelector(
    "div#bootstrapModal > div > div > div.modal-footer"
  );

  DOMTitle.textContent = Title;
  DOMBody.innerHTML = Body;
  DOMFotter.innerHTML = "";

  const CloseButton = document.createElement("button");
  CloseButton.type = "button";
  CloseButton.innerText = "Close";
  CloseButton.dataset.bsDismiss = "modal";
  CloseButton.classList.add("btn", "btn-secondary");

  const ConfirmButton = document.createElement("button");
  ConfirmButton.type = "button";
  ConfirmButton.innerText = "Confirm";
  ConfirmButton.dataset.modalTitle = Title;
  ConfirmButton.dataset.bsDismiss = "modal";
  ConfirmButton.classList.add("btn", "btn-primary");
  ConfirmButton.addEventListener("click", ModalListener);

  DOMFotter.appendChild(CloseButton);
  DOMFotter.appendChild(ConfirmButton);

  const modalInstance = new bootstrap.Modal(bootstrapModal);
  modalInstance.show();
}

function ModalListener() {
  const identifier = this.dataset.modalTitle;

  if (identifier == "Start fresh?") {
    const DOMCanvas = document.getElementById("board");
    const CTX = DOMCanvas.getContext("2d");
    CTX.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function populateSubitems(items) {
  const DOMRoot = document.getElementById("subitems");
  DOMRoot.style.display = "flex";
  DOMRoot.innerHTML = "";

  items.forEach((element) => {
    const DOMElement = document.createElement("div");

    if (element.id) DOMElement.id = element.id;

    if (element.inner) DOMElement.innerHTML = element.inner;

    if (element.tooltip) {
      DOMElement.dataset.bsPlacement = "right";
      DOMElement.dataset.bsToggle = "tooltip";
      DOMElement.dataset.bsTitle = element.tooltip;
      new bootstrap.Tooltip(DOMElement);
    }

    DOMRoot.appendChild(DOMElement);

    if (element.color) {
      const DOMSvg = DOMElement.querySelector("svg");
      if (DOMSvg) DOMSvg.style.fill = element.color;
    }
  });
}

function populateMenu(DOMRoot, JSONData) {
  JSONData.forEach((element) => {
    const DOMElement = document.createElement("div");

    if (element.class) DOMElement.classList.add(element.class);

    if (element.id) DOMElement.id = element.id;

    if (element.inner) DOMElement.innerHTML = element.inner;

    if (element.tooltip) {
      DOMElement.dataset.bsPlacement = "top";
      DOMElement.dataset.bsToggle = "tooltip";
      DOMElement.dataset.bsTitle = element.tooltip;
      new bootstrap.Tooltip(DOMElement);
    }

    if (element.default) DOMElement.classList.add("selected");

    DOMElement.addEventListener("click", () => {
      if (element.selectable || element.subitems) {
        let DOMOldSelected = DOMRoot.querySelector(".selected");
        if (DOMOldSelected) {
          DOMOldSelected.classList.remove("selected");

          let DOMSubItems = document.getElementById("subitems");
          DOMSubItems.style.display = "none";
        }
      }

      if (element.modal) {
        showBootstrapModal(element.modal.title, element.modal.body);
      } else {
        if (element.selectable || element.subitems)
          DOMElement.classList.add("selected");

        if (element.subitems) populateSubitems(element.subitems);
      }
    });

    DOMRoot.appendChild(DOMElement);
  });
}

fetch("./data/menu-buttons.json")
  .then((response) => response.json())
  .then((data) => {
    const DOMToolbar = document.getElementById("toolbar");
    populateMenu(DOMToolbar, data.toolbar);
  });
