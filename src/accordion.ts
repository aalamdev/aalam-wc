import { LitElement, html } from "lit";
import {
    customElement,
    property,
    queryAssignedElements,
} from "lit/decorators.js";

@customElement("aalam-accordion")
export class AalamAccordion extends LitElement {
    
    @property()
    togglesel: string = ".acc-title";

    @property()
    animationDur: number = 200;

    @property()
    bodysel: string = ".acc-body";

    @property({ type: Boolean })
    nocloseall: boolean = false;

    @property({ type: Boolean })
    nomultiple: boolean = false;

    @property({ type: String })
    activecls: string = "acc-active";

    private openItems: Element[] = [];

    @queryAssignedElements({ flatten: true })
    private items!: Element[];

    private processedItems = new Set<HTMLElement>();

    override render() {
        return html`<slot @slotchange=${this.handleSlotChange} @transitionend=${this._handleTransitionEnd} ></slot>`;
    }
    private _handleTransitionEnd(event: any) {
        const body = event.target;
        if (body.style.height == "0px") {
            body.style.display = "none";
        }
        body.style.height = "";
        body.style.overflow = "";
        body.style.transitionProperty = "";
        body.style.transitionDuration = "";
        body.style.transitionTimingFunction = "";
    }

    override attributeChangedCallback( name: string, _old: string | null, value: string | null ): void {
        super.attributeChangedCallback(name, _old, value);
        if (name === "nomultiple") {
            if (this.nomultiple && this.openItems.length > 1) {
                for (let i = 1; i <= this.openItems.length; i++) {
                    this._closeItem(this.openItems[i - 1], i);
                }
            }
        } else if (name === "nocloseall") {
            if (
                this.nocloseall &&
                this.openItems.length === 0 &&
                this.items.length > 0
            ) {
                this._openItem(this.items[0], 0);
            }
        }
    }

    private handleSlotChange(e: Event) {
        const slot = e.target as HTMLSlotElement;
        const newItems = slot.assignedElements({
            flatten: true,
        }) as HTMLElement[];

        newItems.forEach((item, index) => {
            if (this.processedItems.has(item)) {
                return;
            }

            this.processedItems.add(item);
            const toggleElement = item.querySelector(this.togglesel);
            if (toggleElement) {
                toggleElement.addEventListener("click", () =>
                    this.toggle(index)
                );
            }
            if (item.classList.contains(this.activecls)) {
                this._openItem(item, index, false);
            } else {
                const body = item.querySelector(this.bodysel) as HTMLElement;
                if (body) {
                    body.style.display = "none";
                }
            }
        });
    }

    private _openItem(item: Element, index: number, animate: boolean = true) {
        if (this.nomultiple) {
            this.openItems.forEach((openItem) => {
                if (openItem !== item) {
                    this._closeItem(openItem, index);
                }
            });
        }
        if (this.nomultiple && this.nocloseall) {
            this.openItems.forEach((openItem) => {
                if (openItem !== item) {
                    this._closeItem(openItem, index);
                }
            });
        }

        item.classList.add(this.activecls);
        const body = item.querySelector(this.bodysel) as HTMLElement;
        if (body) {
            body.style.display = "block";

            if (animate && this.animationDur !== 0) {
                let height = body.scrollHeight;
                body.style.overflow = "hidden";
                body.style.height = "0px";
                const fullHeight = height + "px";
                body.style.transitionProperty = "height";
                body.style.transitionDuration = `${this.animationDur}ms`;
                body.style.transitionTimingFunction = "ease";

                requestAnimationFrame(() => {
                    body.style.height = fullHeight;
                });
            }
        }
        if (!this.openItems.includes(item)) {
            this.openItems.push(item);
        }
        this.dispatchEvent(
            new CustomEvent("itemopened", { detail: { index } })
        );
    }

    private _closeItem(item: Element, index: number, animate: boolean = true) {
        const isOpen = item.classList.contains(this.activecls);
        if (isOpen && this.nocloseall && this.nomultiple) {
            item.classList.remove(this.activecls);
        }
        if (isOpen && this.nocloseall && this.openItems.length <= 1) {
            return;
        }
        item.classList.remove(this.activecls);
        const body = item.querySelector(this.bodysel) as HTMLElement;
        if (body) {
            if (animate && this.animationDur !== 0) {
                body.style.height = body.scrollHeight + "px";
                body.style.overflow = "hidden";
                body.style.transitionProperty = "height";
                body.style.transitionDuration = `${this.animationDur}ms`;
                body.style.transitionTimingFunction = "ease";

                requestAnimationFrame(() => {
                    body.style.height = "0px";
                });
            } else {
                body.style.display = "none";
            }
        }
        this.openItems = this.openItems.filter((openItem) => openItem !== item);
        this.dispatchEvent(
            new CustomEvent("itemcollapsed", { detail: { index } })
        );
    }

    private toggle(index: number) {
        const item = this.items[index];
        if (!item) {
            return;
        }
        const isOpen = item.classList.contains(this.activecls);
        if (isOpen) {
            this._closeItem(item, index);
        } else {
            this._openItem(item, index);
        }
    }
}
