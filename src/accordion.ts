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

    override attributeChangedCallback(
        name: string,
        _old: string | null,
        value: string | null
    ): void {
        super.attributeChangedCallback(name, _old, value);
        if ( name === "nomultiple" && this.nomultiple && this.openItems.length > 1) {
            for (let i = 1; i <= this.openItems.length; i++) {
                this._closeItem(this.openItems[i - 1], i);
            }
        } else if ( name === "nocloseall" && this.nocloseall && this.openItems.length === 0 && this.items.length > 0 ) {
            this._openItem(this.items[0], 0);
        }
    }

    private handleSlotChange(e: Event) {
        const slot = e.target as HTMLSlotElement;
        const newItems = slot.assignedElements({
            flatten: true,
        }) as HTMLElement[];
        let bkp = new Set(this.processedItems);
        newItems.forEach((item, index) => {
            if (!this.processedItems.has(item)) {
                this.processedItems.add(item);
                item.querySelector(this.togglesel)?.addEventListener(
                    "click",
                    () => this.toggle(index)
                );
                if (item.classList.contains(this.activecls)) {
                    if (this.nomultiple && this.openItems.length >= 1) {
                        this._closeItem(item, index, false);
                    } else {
                        this._openItem(item, index, false);
                    }
                } else {
                    const body = item.querySelector(
                        this.bodysel
                    ) as HTMLElement;
                    if (body) {
                        body.style.display = "none";
                    }
                }
            } else {
                bkp.delete(item);
            }
        });
        bkp.forEach((item) => {
            this.processedItems.delete(item);
        });

        if ( this.nocloseall && this.openItems.length === 0 && this.items.length > 0) {
            this._openItem(this.items[0], 0);
        }
    }

    private _processingOpenItem(item: Element, index: number) {
        this.openItems.forEach((openItem) => {
            if (openItem !== item) {
                this._closeItem(openItem, index);
            }
        });
    }

    private _openItem(item: Element, index: number, animate: boolean = true) {
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
        if (this.nomultiple) {
            this._processingOpenItem(item, index);
        }
        this.dispatchEvent(
            new CustomEvent("itemopened", { detail: { index } })
        );
    }

    private _closeItem(item: Element, index: number, animate: boolean = true) {
        const isOpen = item.classList.contains(this.activecls);
        if (isOpen && this.nocloseall && this.openItems.length === 1 && this.openItems[0] == item) {
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
        if (!item) return;
        const isOpen = item.classList.contains(this.activecls);
        if (isOpen) {
            this._closeItem(item, index);
        } else {
            if (this.nomultiple && this.openItems.length > 0) {
                this._closeItem(this.openItems[0], index);
            }
            this._openItem(item, index);
        }
    }
}
