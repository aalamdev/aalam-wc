import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./accordion";

interface NodeType {
  elementName: string;
  children: NodeType[];
}
@customElement("aalam-navbar")
export class AalamNavbar extends LitElement {
  @property({ type: String }) attr = "";
  @property({ type: String }) mode = "saccordion";
  @property({ type: Number }) cutoffwidth = 0;
  @property({ type: String }) togglesel = "nav-menu";
  @property({ type: String }) pos = "right";
  @property({ type: String }) canvascls = "canvas-body";

  noParentAnchors: NodeType[] = [];
  noParentContianer: HTMLAnchorElement[] = [];
  parentContainer: { [key: string]: HTMLAnchorElement[] } = {};
  anchorElements: HTMLAnchorElement[];
  menu: HTMLElement;
  menuElement: HTMLAnchorElement;
  closeElement: HTMLAnchorElement;
  backElement: HTMLAnchorElement;
  currentPath: HTMLAnchorElement[] = [];
  change: boolean = false;
  overlayContainer: { [key: string]: HTMLElement[] } = {};
  activeClickOutsideListener: ((event: MouseEvent) => void) | null = null;
  navbar: HTMLElement;

  override createRenderRoot() {
    return this;
  }
  override firstUpdated() {
    this.navbar = document.querySelector("aalam-navbar") as HTMLElement;

    const original = this.querySelectorAll(
      this.attr ? `[${this.attr}]` : "a"
    ) as NodeListOf<HTMLAnchorElement>;
    this.anchorElements = Array.from(original).map(
      (anchor) => anchor.cloneNode(true) as HTMLAnchorElement
    );

    const lengthOfInput = this.anchorElements.length;

    let i = 0;
    while (i < lengthOfInput) {
      const anchor = this.anchorElements[i];
      const attrValue = anchor.getAttribute(this.attr) || "";
      const attributes = this.parseAttributes(attrValue);
      const attrName = attributes.nm;

      if (!attributes.pnt) {
        this.noParentAnchors.push({ elementName: attrName, children: [] });
        if (!(attrName === "menu") && !(attrName == "back"))
          this.noParentContianer.push(anchor);
      } else {
        if (!this.parentContainer[attributes.pnt]) {
          this.parentContainer[attributes.pnt] = [];
        }
        this.parentContainer[attributes.pnt].push(anchor);
      }
      i++;
    }
    
    const toggle = this.querySelector(this.togglesel);
    if (toggle) {
      const originalMenu = toggle as HTMLAnchorElement;
      this.menuElement = originalMenu.cloneNode(true) as HTMLAnchorElement;
      originalMenu.style.display = "none";
      document.body.appendChild(this.menuElement);
    }

    this.menuElement.style.display = "block";
    this.menuElement.style.width = "100%";
    this.menuElement.style.background = "blue";

    let temps = document.getElementsByTagName("template");

    Array.from(temps).forEach((template) => {
      if (template.getAttribute("data-type") === "back") {
        const newContent = template.content.cloneNode(true) as DocumentFragment;
        this.backElement = document.createElement("a");
        this.backElement.appendChild(newContent.cloneNode(true));
      } else if (template.getAttribute("data-type") === "close") {
        const newContent = template.content.cloneNode(true) as DocumentFragment;
        this.closeElement = document.createElement("a");
        this.closeElement.appendChild(newContent.cloneNode(true));
      }
    });

    this.backElement.id = "back";
    this.closeElement.id = "close";
    this.parentContainer["menu"] = this.noParentContianer;
    if (this.cutoffwidth === 0) {
      this.cutoffwidth = this.getNavbarLength();
    }

    window.addEventListener("resize", this.updateNavbar.bind(this));
    this.updateNavbar();

    this.menuElement.onclick = this.handleMenu.bind(this);
    this.closeElement.onclick = this.handleClose.bind(this);

    this.menu = document.createElement("div");
    if (this.mode == "overlay") {
      this.menu.appendChild(this.overlayNode());
    } else if (this.mode == "saccordion") {
      this.menu.appendChild(this.accordionCreator());
    } else {
      this.menu.appendChild(this.accordionCreator("menu", false));
    }
    this.menu.style.display = "none";
    document.body.appendChild(this.menu);

    for (const key in this.overlayContainer) {
      const anchor = this.getAnchorElement(key);
      if (anchor) {
        anchor.onclick = () => {
          if (this.currentPath.length > 0) {
            const previousAnchor =
              this.currentPath[this.currentPath.length - 1];

            const attributes = this.parseAttributes(
              previousAnchor.getAttribute("attr") || ""
            );
            this.overlayContainer[attributes.nm][0].style.display = "none";
          }
          this.overlayContainer[key][0].style.display = "block";
          this.currentPath.push(anchor);
        };
      }
    }

    const elements = document.querySelectorAll("#close");
    elements.forEach((element) => {
      (element as HTMLAnchorElement).onclick = () => this.handleClose();
    });

    const ele = document.querySelectorAll("#back");
    ele.forEach((element) => {
      (element as HTMLAnchorElement).onclick = () => this.handleBack();
    });

    this.menu.classList.add(this.canvascls);
  }

  overlayNode(parentName: string = "menu"): HTMLElement {
    const dive = document.createElement("div");
    if (parentName == "menu") {
      const div = document.createElement("div");
      div.appendChild(this.closeElement);
      dive.appendChild(div);
    }
    this.parentContainer[parentName].forEach((child) => {
      const div = document.createElement("div");
      div.appendChild(child);
      dive.appendChild(div);
      const attributes = this.parseAttributes(child.getAttribute("attr") || "");
      this.overlayCreator(attributes.nm);
    });

    return dive;
  }

  overlayCreator(anchorName: string): void {
    const children = this.parentContainer[anchorName];

    const closeCloned = this.closeElement.cloneNode(true) as HTMLAnchorElement;
    closeCloned.style.display = "block";

    const backCloned = this.backElement.cloneNode(true) as HTMLAnchorElement;
    if (anchorName == "menu") backCloned.style.display = "none";
    else {
      backCloned.style.display = "block";
    }
    const anchorE = this.getAnchorElement(anchorName);
    const overlay = document.createElement("div");
    if (children) {
      overlay.id = `overlay-dropdown-${anchorName}`;
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 1)";
      overlay.style.zIndex = "1000";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";

      const parentName = document.createElement("h3");
      if (anchorE) parentName.textContent = anchorE.innerHTML;
      parentName.style.marginRight = "10px";

      const header = document.createElement("div");
      header.style.padding = "10px";
      header.style.color = "#ffffff";
      header.style.display = "flex";
      header.style.width = "100%";

      header.appendChild(backCloned);

      header.appendChild(parentName);
      header.appendChild(closeCloned);
      overlay.appendChild(header);

      const dbox = document.createElement("div");

      const anchor = this.getAnchorElement(anchorName);
      if (anchor) {
        const attributes = this.parseAttributes(
          anchor.getAttribute("attr") || ""
        );
        if (attributes.mode == "overlay") {
          dbox.appendChild(this.overlayNode(attributes.nm));
        } else if (attributes.mode == "maccordion") {
          dbox.appendChild(this.accordionCreator(attributes.nm, false));
        } else {
          dbox.appendChild(this.accordionCreator(attributes.nm));
        }
      }
      overlay.appendChild(dbox);
      overlay.style.display = "none";
      this.overlayContainer[anchorName] = [overlay];
      if (this.menu) this.menu.appendChild(overlay);

      const clickOutsideListener = (event: MouseEvent) => {
        if (dbox.contains(event.target as Node)) {
          document.removeEventListener("click", clickOutsideListener);
        } else if (!overlay.contains(event.target as Node)) {
          this.handleClose();
          document.removeEventListener("click", clickOutsideListener);
        }
      };

      if (anchorE) {
        anchorE.addEventListener("click", (event) => {
          event.stopPropagation();

          if (this.activeClickOutsideListener) {
            document.removeEventListener(
              "click",
              this.activeClickOutsideListener
            );
          }

          document.addEventListener("click", clickOutsideListener);
          this.activeClickOutsideListener = clickOutsideListener;
        });
      }

      closeCloned.addEventListener("click", () => {
        this.handleClose();
        if (this.activeClickOutsideListener) {
          document.removeEventListener(
            "click",
            this.activeClickOutsideListener
          );
        }
        this.activeClickOutsideListener = null;
      });
    }
  }

  accordionCreator(
    parentName: string = "menu",
    noMultiple: boolean = true
  ): HTMLElement {
    const saccordion = document.createElement("aalam-accordion");
    saccordion.nomultiple = noMultiple;
    const children = this.parentContainer[parentName];
    if (parentName == "menu") {
      const div = document.createElement("div");
      const divp = document.createElement("div");
      divp.className = "acc-title";
      divp.appendChild(this.closeElement);
      div.appendChild(divp);
      saccordion.appendChild(div);
    }
    if (children)
      children.forEach((child) => {
        const div = document.createElement("div");
        const attributes = this.parseAttributes(
          child.getAttribute("attr") || ""
        );
        const mod = attributes.mode || "saccordion";
        const childName = attributes.nm;

        const divp = document.createElement("div");
        const divc = document.createElement("div");

        divp.className = "acc-title";
        divc.className = "acc-body";

        divp.appendChild(child);

        if (this.parentContainer[childName]) {
          if (mod == "saccordion") {
            divc.appendChild(this.accordionCreator(childName));
          } else if (mod == "overlay") {
            divc.appendChild(this.overlayNode(childName));
          } else {
            divc.appendChild(this.accordionCreator(childName, false));
          }
        }

        div.appendChild(divp);
        div.appendChild(divc);
        saccordion.appendChild(div);
      });
    return saccordion;
  }

  parseAttributes(attrString: string | null): { [key: string]: string } {
    const attrObject: { [key: string]: string } = {};

    if (attrString) {
      const attrArray = attrString.split(";");
      attrArray.forEach((attr) => {
        const [key, value] = attr.split(":");
        if (key && value) {
          attrObject[key.trim()] = value.trim();
        }
      });
    }

    return attrObject;
  }
  
  updateNavbar() {
    if (window.innerWidth < this.cutoffwidth) {
      if (!this.change) {
        this.navbar.style.display = "none";
      }

      this.menuElement.style.display = "block";
      this.change = true;
      this.anchorElements.forEach((anchor) => {
        anchor.style.display = "block";
      });
    } else {
      if (this.change) {
        this.handleClose();
        this.change = false;
      }
      this.menuElement.style.display = "none";
      this.navbar.style.display = "block";
    }
  }

  getAnchorElement(elementName: string): HTMLAnchorElement | null {
    const anchorElement = Array.from(this.anchorElements).find(
      (anchor) =>
        this.parseAttributes(anchor.getAttribute("attr") || "").nm ===
        elementName
    );
    return anchorElement || null;
  }

  handleMenu(event: Event) {
    const clickedAnchor = event.currentTarget as HTMLAnchorElement;
    clickedAnchor.style.display = "none";
    if (this.mode == "overlay") this.menu.style.display = "block";
    else if (this.mode == "saccordion") this.menu.style.display = "block";
    else this.menu.style.display = "block";
  }
  handleClose() {
    this.menu.style.display = "none";
    this.menuElement.style.display = "block";
    const len = this.currentPath.length;
    if (this.activeClickOutsideListener) {
      document.removeEventListener("click", this.activeClickOutsideListener);
    }
    if (len) {
      const anchor = this.currentPath[len - 1];
      const attributes = this.parseAttributes(
        anchor.getAttribute("attr") || ""
      );
      this.overlayContainer[attributes.nm][0].style.display = "none";
    }
    this.currentPath = [];
  }
  handleBack() {
    const currentAnchor = this.currentPath[this.currentPath.length - 1];
    const currentAnchorName = this.parseAttributes(
      currentAnchor.getAttribute("attr") || ""
    ).nm;
    this.overlayContainer[currentAnchorName][0].style.display = "none";
    this.currentPath.pop();

    const cAnchor = this.currentPath[this.currentPath.length - 1];
    if (cAnchor) {
      const cAnchorName = this.parseAttributes(
        cAnchor.getAttribute("attr") || ""
      ).nm;
      this.overlayContainer[cAnchorName][0].style.display = "block";
    }
  }

  getNavbarLength(): number {
    let len = 0;
    const original = this.querySelectorAll(
      this.attr ? `[${this.attr}]` : "a"
    ) as NodeListOf<HTMLAnchorElement>;
    const lengthOfInput = original.length;

    let i = 0;
    while (i < lengthOfInput) {
      const anchor = original[i];
      const attrValue = anchor.getAttribute(this.attr) || "";
      const attributes = this.parseAttributes(attrValue);
      const attrName = attributes.nm;

      if (!attributes.pnt) {
        this.noParentAnchors.push({ elementName: attrName, children: [] });
        if (!(attrName === "menu"))
        {
          len+=anchor.offsetWidth;
        }
      }
      i++;
    }
    console.log(len);

    return len+35;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "aalam-navbar": AalamNavbar;
  }
}
