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
    console.log("Clear Canvas");
  }
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
    }

    if (element.modal) {
      DOMElement.addEventListener("click", () => {
        showBootstrapModal(element.modal.title, element.modal.body);
      });
    }

    DOMRoot.appendChild(DOMElement);
  });
}

fetch("./data/menu-buttons.json")
  .then((response) => response.json())
  .then((data) => {
    const DOMToolbar = document.getElementById("toolbar");
    const DOMZoombar = document.getElementById("zoombar");
    populateMenu(DOMToolbar, data.toolbar);
    populateMenu(DOMZoombar, data.zoombar);

    // Load Bootstrap Tooltips
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  });
