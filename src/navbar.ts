import { LitElement,  } from "lit";
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
  @property({ type: String }) pos = "left";
  @property({ type: String }) canvascls = "canvas-body";
  @property({ type: Number }) padding = 10;

  
  noParentAnchors: NodeType[] = [];
  noParentContianer: HTMLAnchorElement[] = [];
  parentContainer: { [key: string]: HTMLAnchorElement[] } = {};
  anchorElements: NodeListOf<HTMLAnchorElement>;
  menu: HTMLElement;
  menuElement: HTMLAnchorElement;
  closeElement: HTMLAnchorElement;
  backElement: HTMLAnchorElement;
  currentPath: HTMLAnchorElement[] = [];
  change: boolean = false;
  overlayContainer: { [key: string]: HTMLElement[] } = {};
  
  
  override firstUpdated() {
    this.anchorElements = this.querySelectorAll(
      "a"
    ) as NodeListOf<HTMLAnchorElement>;
    const lengthOfInput = this.anchorElements.length;

    let i = 0;
    while (i < lengthOfInput) {
      const anchor = this.anchorElements[i];
      const attrValue = anchor.getAttribute("attr") || "";
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
      if (attributes.nm == "menu") this.menuElement = anchor;
      else if (attributes.nm == "back") this.backElement = anchor;
      else if (attributes.nm == "close") this.closeElement = anchor;
      i++;
    }

    this.parentContainer["menu"] = this.noParentContianer;

    this.menuElement.style.display = "block";
    this.menuElement.style.width = "100%";
    this.menuElement.style.background = "blue";
    document.body.appendChild(this.menuElement);
    //console.log(this.closeElement);
    if (this.cutoffwidth === 0) {
      this.cutoffwidth = this.getNavbarLength();
    }
    this.backElement.id = "back";
    this.closeElement.id = "close";


    let temps = document.getElementsByTagName("template");

Array.from(temps).forEach(template => {
  const newElementIMG = template.content.querySelector("img");
  const newElementSVG = template.content.querySelector("svg");
  if (template.getAttribute('data-type') === "back") {
    const imgElement = this.backElement.querySelector('img');
    if (imgElement) {
      if (newElementIMG) {
        imgElement.replaceWith(newElementIMG.cloneNode(true) as HTMLImageElement);
      } else if (newElementSVG) {
        imgElement.replaceWith(newElementSVG.cloneNode(true) as SVGElement);
      }
    } 
  }
  
});

    

    

    window.addEventListener("resize", this.updateNavbar.bind(this));
    this.updateNavbar();

    

    this.menuElement.onclick = this.handleMenu.bind(this);
    this.closeElement.onclick = this.handleClose.bind(this);

    if (this.mode == "overlay") {
      this.menu = this.overlayNode();
    } else if (this.mode == "saccordion") {
      this.menu = this.saccordionCreator();
    } else {
      this.menu = this.maccordionCreator();
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
   // console.log(this.backElement);
    
    



  }

  overlayNode(parentName: string = "menu"): HTMLElement {
    // console.log('hi');
    const dive = document.createElement("div");
    this.parentContainer[parentName].forEach((child) => {
      const div = document.createElement("div");
      div.appendChild(child);
      dive.appendChild(div)
      const attributes = this.parseAttributes(child.getAttribute("attr") || "");
      this.overlayCreator(attributes.nm);
    });

    return dive;
  }

  overlayCreator(anchorName: string): void {
    const children = this.parentContainer[anchorName];
    //console.log(children);

    const closeCloned = this.closeElement.cloneNode(true) as HTMLAnchorElement;
    closeCloned.style.display = "block";

    const backCloned = this.backElement.cloneNode(true) as HTMLAnchorElement;
    if(anchorName=='menu')backCloned.style.display = "none";
    else backCloned.style.display = "block";

    const overlay = document.createElement("div");
    if (children) {
      overlay.id = `overlay-dropdown-${anchorName}`;
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      overlay.style.zIndex = "1000";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "flex-start";
      overlay.style.padding = "10px";

      const parentName = document.createElement("span");
      parentName.textContent = anchorName;
      parentName.style.color = "white";
      parentName.style.marginRight = "10px";

      const dropdown = document.createElement("div");
      dropdown.style.backgroundColor = "white";
      dropdown.style.padding = "10px";
      dropdown.style.border = "1px solid #ccc";
      dropdown.style.display = "flex";
      dropdown.style.flexDirection = "column";
      dropdown.style.width = "100%";

      dropdown.appendChild(closeCloned);
      dropdown.appendChild(backCloned);
      dropdown.appendChild(parentName);

      const anchor = this.getAnchorElement(anchorName);
      if (anchor) {
        const attributes = this.parseAttributes(
          anchor.getAttribute("attr") || ""
        );
        //console.log(attributes);
        if (attributes.mode == "overlay") {
          //console.log('hi');
          dropdown.appendChild(this.overlayNode(attributes.nm));
        } else if (attributes.mode == "maccordion") {
          dropdown.appendChild(this.maccordionCreator(attributes.nm));
        } else {
          dropdown.appendChild(this.saccordionCreator(attributes.nm));
        }
      }

      overlay.appendChild(dropdown);
      overlay.style.display = "none";
      this.overlayContainer[anchorName] = [overlay, dropdown];
      document.body.appendChild(overlay);

      const handleClickOutside = (event: MouseEvent) => {
        if (!dropdown.contains(event.target as Node)) {
          const len = this.currentPath.length;
          if (len) {
            const anchor = this.currentPath[len - 1];
            const attributes = this.parseAttributes(
              anchor.getAttribute("attr") || ""
            );
            this.overlayContainer[attributes.nm][0].style.display = "none";
          }
          this.currentPath = [];
        }
      };

      overlay.addEventListener("click", handleClickOutside);
    }
  }

  saccordionCreator(parentName: string = "menu"): HTMLElement {
    const saccordion = document.createElement("aalam-accordion");
    saccordion.nomultiple = true;

    //const parent = this.getAnchorElement(parentName);
    const children = this.parentContainer[parentName];

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
            divc.appendChild(this.saccordionCreator(childName));
          } else if (mod == "overlay") {
            divc.appendChild(this.overlayNode(childName));
          } else {
            divc.appendChild(this.maccordionCreator(childName));
          }
        }

        div.appendChild(divp);
        div.appendChild(divc);
        saccordion.appendChild(div);
      });
    return saccordion;
  }

  maccordionCreator(parentName: string = "menu"): HTMLElement {
    const maccordion = document.createElement("aalam-accordion");
    //maccordion.nomultiple = false;

    //const parent = this.getAnchorElement(parentName);
    const children = this.parentContainer[parentName];

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
            divc.appendChild(this.saccordionCreator(childName));
          } else if (mod == "overlay") {
            divc.appendChild(this.overlayNode(childName));
          } else {
            divc.appendChild(this.maccordionCreator(childName));
          }
        }

        div.appendChild(divp);
        div.appendChild(divc);
        maccordion.appendChild(div);
      });
    return maccordion;
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

  getNavbarLength(): number {
    let len = 0;
    this.noParentAnchors.forEach((anchor) => {
      const anchorElement = this.getAnchorElement(anchor.elementName);
      if (anchorElement) {
        len += anchorElement.offsetWidth;
      }
    });
    return len;
  }
  updateNavbar() {
    if (window.innerWidth < this.cutoffwidth) {
      if (!this.change) {
        this.menuElement.style.display = "block";
        this.change = true;
      }
      
    } else {
      this.anchorElements.forEach((anchor) => {
        anchor.style.display = "none";
        if (this.change) {
          window.location.reload();
          this.change = false;
        }
      });
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
    console.log("close");
    //const clickedAnchor = event.currentTarget as HTMLAnchorElement;
    this.menu.style.display = "none";
    this.menuElement.style.display = "block";
    const len = this.currentPath.length;
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
    const currentAnchor = this.currentPath[this.currentPath.length-1];
    const currentAnchorName = this.parseAttributes(currentAnchor.getAttribute("attr") || "").nm;
    this.overlayContainer[currentAnchorName][0].style.display="none";
    this.currentPath.pop();

    const cAnchor = this.currentPath[this.currentPath.length-1];
    const cAnchorName = this.parseAttributes(cAnchor.getAttribute("attr") || "").nm;
    this.overlayContainer[cAnchorName][0].style.display="block";


  }
  appendBody() {
    const navBar = document.createElement("div");

    navBar.style.justifyContent = "space-between";
    navBar.style.width = "100%";

    this.noParentAnchors.forEach((anchor) => {
      const anchorElement = this.getAnchorElement(anchor.elementName);
      //const dive = document.createElement("div");

      if (anchorElement) navBar.appendChild(anchorElement);
    });

    document.body.appendChild(navBar);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "aalam-navbar": AalamNavbar;
  }
}
