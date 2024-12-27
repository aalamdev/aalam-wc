import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./accordion";
import { parseAttrVal as parseAttributes } from "./utils";

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
    anchorAttributes: Map<HTMLAnchorElement, { [key: string]: string }> = new Map();

    override connectedCallback() {
        super.connectedCallback();
        this.activeClickOutsideListener = (event: MouseEvent) => {
            if (this.menuElement.style.display === "block" && this.activeClickOutsideListener) { 
                document.removeEventListener("click", this.activeClickOutsideListener);
                return;
            }
            const target = event.target as HTMLElement;
            if (!this.menu.contains(target) && !this.menuElement.contains(target)) {
                this.handleClose();
            }
        };
        document.addEventListener('click', this.activeClickOutsideListener);
    }

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

        for(let anchor of this.anchorElements) {
            const attrValue = anchor.getAttribute(this.attr) || "";
            const attributes = parseAttributes(attrValue);
            this.anchorAttributes.set(anchor, attributes);
            const attrName = attributes.nm;

            if (!attributes.pnt) {
                this.noParentAnchors.push({ elementName: attrName, children: [] });
                if (!(attrName === "menu"))
                    this.noParentContianer.push(anchor);
            } else {
                if (!this.parentContainer[attributes.pnt]) {
                    this.parentContainer[attributes.pnt] = [];
                }
                this.parentContainer[attributes.pnt].push(anchor);
            }
        }
        
        const toggle = this.querySelector(this.togglesel);
        this.menuElement = toggle as HTMLAnchorElement;
        this.menuElement.style.display = "none";
        document.body.appendChild(this.menuElement);
        this.menuElement.style.display = "block";
        this.menuElement.style.width = "100%";
        this.menuElement.style.background = "blue";

        let temps = this.navbar.getElementsByTagName("template");

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

        this.parentContainer[""] = this.noParentContianer;
        if (this.cutoffwidth === 0) {
            this.cutoffwidth = this.getNavbarLength() + 100;
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
            this.menu.appendChild(this.accordionCreator("", false));
        }
        this.menu.style.display = "none";
        document.body.appendChild(this.menu);
        this.menu.classList.add(this.canvascls);
    }

    overlayNode(parentName: string = ""): HTMLElement {
        const dive = document.createElement("div");
        if (parentName == "") {
            const div = document.createElement("div");
            div.appendChild(this.closeElement);
            dive.appendChild(div);
        }
        this.parentContainer[parentName].forEach((child) => {
            const div = document.createElement("div");
            div.appendChild(child);
            dive.appendChild(div);
            const attributes = this.anchorAttributes.get(child) || {};
            this.overlayCreator(attributes.nm);
        });

        return dive;
    }


	overlayCreator(anchorName: string): void {
		const children = this.parentContainer[anchorName];
	
		const closeCloned = this.closeElement.cloneNode(true) as HTMLAnchorElement;
		closeCloned.style.display = "block";
	
		const backCloned = this.backElement.cloneNode(true) as HTMLAnchorElement;
		if (anchorName == "") backCloned.style.display = "none";
		else {
			backCloned.style.display = "block";
		}
		const anchor = this.getAnchorElement(anchorName);
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
			if (anchor) parentName.textContent = anchor.innerHTML;
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
	
			if (anchor) {
				const attributes = this.anchorAttributes.get(anchor) || {};
				const mod = attributes.mode || this.mode;
				if (mod == "overlay") {
					dbox.appendChild(this.overlayNode(attributes.nm));
				} else if (mod == "maccordion") {
					dbox.appendChild(this.accordionCreator(attributes.nm, false));
				} else if (mod == "saccordion") {
					dbox.appendChild(this.accordionCreator(attributes.nm));
				}
			}
			overlay.appendChild(dbox);
			overlay.style.display = "none";
			this.overlayContainer[anchorName] = [overlay];
			if (this.menu) this.menu.appendChild(overlay);
	
			backCloned.onclick = this.handleBack.bind(this);
			closeCloned.onclick = this.handleClose.bind(this);
			if (anchor) anchor.onclick = this.handleClick.bind(this); 
		};
	}
	
	accordionCreator(
		parentName: string = "",
		noMultiple: boolean = true
	): HTMLElement {
		const saccordion = document.createElement("aalam-accordion");
		saccordion.nomultiple = noMultiple;
		const children = this.parentContainer[parentName];
		if (parentName == "") {
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
				const attributes = this.anchorAttributes.get(child) || {};
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
				this.anchorAttributes.get(anchor)?.nm ===
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
		if (this.activeClickOutsideListener) document.addEventListener('click', this.activeClickOutsideListener);
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
			const attributes = this.anchorAttributes.get(anchor) || {};
			this.overlayContainer[attributes.nm][0].style.display = "none";
		}
		this.currentPath = [];
	}
	
	handleBack() {
		const currentAnchor = this.currentPath[this.currentPath.length - 1];
		const currentAnchorName = (this.anchorAttributes.get(currentAnchor) || {}).nm;
		this.overlayContainer[currentAnchorName][0].style.display = "none";
		this.currentPath.pop();
	
		const cAnchor = this.currentPath[this.currentPath.length - 1];
		if (cAnchor) {
			const cAnchorName = (this.anchorAttributes.get(cAnchor) || {}).nm;
			this.overlayContainer[cAnchorName][0].style.display = "block";
		}
	}
	
	getNavbarLength(): number {
		let len = 0;
		this.noParentContianer.forEach((anchor) => {
			document.body.appendChild(anchor);
			len = len + anchor.offsetWidth;
			document.body.removeChild(anchor);
		});
		return len;
	}
	
	handleClick(event: Event) {
		const anchor = event.currentTarget as HTMLAnchorElement;
		if (this.currentPath.length > 0) {
			const previousAnchor = this.currentPath[this.currentPath.length - 1];
	
			const attributes = this.anchorAttributes.get(previousAnchor) || {};
			this.overlayContainer[attributes.nm][0].style.display = "none";
		}
		const anchorName = (this.anchorAttributes.get(anchor) || {}).nm;
		this.overlayContainer[anchorName][0].style.display = "block";
		this.currentPath.push(anchor);
	}
	}
	
	declare global {
		interface HTMLElementTagNameMap {
			"aalam-navbar": AalamNavbar;
		}
	}
	