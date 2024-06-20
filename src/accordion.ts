import { LitElement, html, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";

@customElement("aalam-accordion")
export class AalamAccordion extends LitElement {
    static override styles = css`
       
    `;

    @property()
    togglesel: string = ".acc-title";

    @property()
    bodysel: string = ".acc-body";

    @property({ type: Boolean })
    nocloseall: boolean = false;

    @property({ type: Boolean })
    nomultiple: boolean = false;

    @property({ type: Boolean })
    alwaysopen: boolean = false;

    @property({ type: String })
    activecls: string = "acc-active";

    @state()
    open_count: number = 0;

    override render() {
        return html`<slot >

        </slot>`;
    }

    override firstUpdated() {
        const items = this.querySelectorAll("div");

        items.forEach((item, index) => {
            item.querySelector(this.togglesel)?.addEventListener("click", () =>
                this.toggle(item, index)
            );
            if (item.classList.contains(this.activecls)) {
                this.openItem(item);
            }
        });

        if (this.nomultiple && this.open_count > 1) {
            let firstActiveFound = false;
            items.forEach((item) => {
                if (item.classList.contains(this.activecls)) {
                    if (!firstActiveFound) {
                        firstActiveFound = true;
                    } else {
                        this.closeItem(item);
                    }
                }
            });
        }
    }

    openItem(item: Element) {
        item.classList.add(`${this.activecls}`);
        this.open_count += 1;
    }

    closeItem(item: Element) {
        item.classList.remove(`${this.activecls}`);
        this.open_count -= 1;
    }

    toggle(item: Element, index: number) {
        const isOpen = item.classList.contains(`${this.activecls}`);

        if (isOpen && this.nocloseall) {
            const openItems = Array.from(this.querySelectorAll("div")).filter(
                (el) => el.classList.contains(`${this.activecls}`)
            );
            if (openItems.length <= 1) {
                return;
            }
        }

        if (isOpen) {
            this.closeItem(item);
            this.dispatchEvent(
                new CustomEvent("itemcollapsed", { detail: { index } })
            );
        } else {
            if (this.nomultiple) {
                this.querySelectorAll("div").forEach((el) => {
                    if (el !== item) {
                        this.closeItem(el);
                    }
                });
            }
            this.openItem(item);
            this.dispatchEvent(
                new CustomEvent("itemopened", { detail: { index } })
            );
        }
    }
}
