import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { queryAssignedElements } from "lit/decorators.js";

@customElement("aalam-sgn-box")
export class SuggestionBox extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
        }
    `;

    @property({ type: Array<Object> })
    list: Array<{ [key: string]: any }> = [];

    @property()
    listkey: string = "";

    @property()
    slot_input = null;

    @property()
    _private_slot_el: boolean = false;

    @queryAssignedElements({ slot: "sgn-item-template" })
    template_slots: Array<HTMLElement>;

    @queryAssignedElements({ slot: "__private-item" })
    private_items: Array<HTMLElement>;

    @property()
    prevItem: number = 0;

    @state()
    has_more: boolean = false;

    @state()
    index: number = -1;

    @property()
    size: number = 0;

    @state()
    show_empty: boolean = true;

    @property()
    result: Array<{ [key: string]: string }> = [];

    @property()
    highlight: string = "";

    @property()
    curr_index: number = 0;

    @property()
    input_el: HTMLElement | null = null;

    @property()
    filtered_list: Array<{ [key: string]: string }> = [];

    @property()
    prevIndex: number = 0;

    @state()
    show_container = false;

    private _outClickListener = this.windowClickEvent.bind(this);
    private input_temp: HTMLElement | null | string = null;

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("mouseout", this._mouseOutEvent);
        document.addEventListener("click", this._outClickListener);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("mouseout", this._mouseOutEvent);
        document.addEventListener("click", this._outClickListener);
    }
    render() {
        return html`
            <div style="position:relative">
                <div
                    part="sgn-input"
                    class="inputbox"
                    @focusin=${this._inputFocusEvent}
                    @keydown=${this.keyDownInputEvent}
                >
                    <slot
                        name="sgn-input"
                        @input=${this.InputEvent}
                        @click=${this.inputfield}
                        ><input type="search"
                    /></slot>
                </div>
                <slot name="sgn-item-template" style="display:none"></slot>
                <div
                    part="sgn-container"
                    style="display:${this.show_container ? "block" : "none"};"
                >
                    <div style="display:${this.show_empty ? "block" : "none"}">
                        <slot name="sgn-empty"></slot>
                    </div>
                    <div
                        style="display:${!this.show_empty ? "block" : "none"};"
                        @click=${this.saveInputEvent}
                        @mouseover=${this.mouseOverEvent}
                    >
                        <slot name="__private-item"></slot>
                    </div>
                </div>
            </div>
        `;
    }
    private _indexOfTarget(event: any) {
        let el = event.target;
        while (el) {
            if (el.slot == "__private-item") break;
            el = el.parentElement;
        }
        return this.private_items.indexOf(el);
    }
    saveInputEvent(event: Event) {
        if (this.result[this._indexOfTarget(event)]) {
            (this.input_el as HTMLInputElement).value =
                this.result[this._indexOfTarget(event)]?.["name"];
        } else if (this._indexOfTarget(event) === this.result.length) {
            this.loadmoreentry(event);
        }
    }

    mouseOverEvent(e: any) {
        this.curr_index = this._indexOfTarget(e);
        this.index = this.curr_index;

        if (this.prevIndex >= 0) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove("sgn-active");
            }
        }

        if (this.curr_index >= 0) {
            this.private_items[this.curr_index].classList.add("sgn-active");
        }

        this.prevIndex = this.curr_index;
    }

    inputfield() {
        this.index = -1;
    }
    private _inputFocusEvent(event: any) {
        if (event.target.tagName == "INPUT") this.show_container = true;
    }
    private _mouseOutEvent() {
        if (this.prevIndex >= 0 && this.prevIndex < this.result.length) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove("sgn-active");
            }
        }
    }
    windowClickEvent(event: any) {
        let el = event.target;
        console.log(el.parentElement);
        while (el) {
            if (el == this) return;
            el = el.parentElement;
        }
        this.show_container = false;
    }
    private _format(str: any, obj: any) {
        if (typeof obj == "string" || typeof obj == "number") return obj;
        else {
            for (let key of Object.keys(obj)) {
                let template: any;
                if (key === "name") {
                    template =
                        this.highlight === "matched"
                            ? this._highlight(obj[key])
                            : this._startsWithHighlight(obj[key]);
                } else {
                    template = obj[key];
                }

                str = str.replace(
                    new RegExp("\\{" + key + "\\}", "gi"),
                    template
                );
            }
            return str;
        }
    }
    keyDownInputEvent(e: any) {
        const resultLength = this.result.length;
        switch (e.key) {
            case "ArrowUp":
                this.index =
                    this.index === -1 || (this.has_more && this.index === 0)
                        ? resultLength + (this.has_more ? 0 : 0)
                        : (this.index -
                              1 +
                              resultLength +
                              (this.has_more ? 1 : 0)) %
                          (resultLength + (this.has_more ? 1 : 0));

                this.setActive(resultLength);
                break;
            case "ArrowDown":
                this.index =
                    this.index === -1 ||
                    (this.has_more && this.index === resultLength)
                        ? 0
                        : (this.index + 1) %
                          (resultLength + (this.has_more ? 1 : 0));
                this.setActive(resultLength);
                break;

            case "Enter":
                if (this.index === resultLength) {
                    this.loadmoreentry(e);
                } else {
                    this.setInputValue();
                }
                break;
        }
    }
    InputEvent(e: any) {
        this.prevIndex = 0;
        this.index = -1;
        this.input_el = e.target;
        if (this.list) {
            if ((this.input_el as HTMLInputElement)?.value) {
                this.filtered_list = this.list.filter((item) =>
                    item[this.listkey].includes(
                        (this.input_el as HTMLInputElement)?.value
                    )
                );

                this.setSuggestion(this.filtered_list, false);
            } else {
                this.filtered_list = [];

                this.setSuggestion(this.filtered_list, false);
            }
        }
        return;
    }

    setActive(resultLength: number) {
        if (this.prevIndex >= 0 && this.prevIndex < resultLength) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove("sgn-active");
            }
        }
        if (this.index >= 0 && this.index < resultLength) {
            const selectedItem = this.private_items[this.index];

            if (selectedItem) {
                if (this.prevIndex != -1) {
                    this.private_items[this.prevIndex].classList.remove(
                        "sgn-active"
                    );
                }
                selectedItem.classList.add("sgn-active");
            }
        } else if (this.index == resultLength && this.has_more) {
            this.private_items[this.index].classList.add("sgn-active");
        }

        this.prevIndex = this.index;
    }

    setInputValue() {
        const selectedValue = this.result[this.index]?.name;
        this.prevIndex = this.index;
        if (selectedValue) {
            (this.input_el as HTMLInputElement).value = selectedValue;
        }
    }
    _highlight(name: any) {
        const input = (this.input_el as HTMLInputElement)?.value;
        if (input && name.toLowerCase().includes(input.toLowerCase())) {
            const parts = name.split(new RegExp(`(${input})`, "gi"));

            return parts
                .map((part: any, index: number) => {
                    if (index !== 0) {
                        return `<span class="sgn-highlight">${part}</span>`;
                    } else {
                        return part;
                    }
                })
                .join("");
        }
        return name;
    }
    _startsWithHighlight(name: any) {
        const input = (this.input_el as HTMLInputElement)?.value;
        if (input && name.toLowerCase().startsWith(input.toLowerCase())) {
            const start = name.substring(0, input.length);
            const rest = name.substring(input.length);
            return `<span class="sgn-highlight" >${start}</span>${rest}`;
        }
        return name;
    }
    setSuggestion(
        suggestions: Array<{ [key: string]: string }>,
        has_more?: boolean
    ) {
        this.result = [...suggestions];
        this.index = this.index;
        this.input_temp = (this.input_el as HTMLInputElement)?.value;

        this.input_temp ? (this.show_empty = false) : (this.show_empty = true);
        this.has_more = has_more || false;
        if (this._private_slot_el) {
            for (let el of this.private_items) el.remove();
        }
        this.size = suggestions.length;
        for (let i of suggestions) {
            let tmp = this.template_slots[0].innerHTML;
            let temp = this._format(tmp, i);
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML = temp;
            this.appendChild(el);
            this._private_slot_el = true;
        }
        if (this._private_slot_el && has_more) {
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML = `<div class="container"><div>Loadmore</div></div>`;
            this.appendChild(el);
        }
    }
    loadmoreentry(event:Event) {
        const loadmore = new CustomEvent("loadmore", {
            bubbles: true,
        });
        if (this._private_slot_el) {
            this.private_items[this.private_items.length - 1].remove();
        }

        this.dispatchEvent(loadmore);
        event.stopPropagation();
    }

    appendSuggestion(
        suggestions: Array<{ [key: string]: string }>,
        has_more: boolean
    ) {
        this.result = [...this.result];
        this.result.push(...suggestions);
        this.result = this.result.flat(Infinity);
        this.has_more = has_more;
        this.size = this.size + suggestions.length;
        for (let i of suggestions) {
            let tmp = this.template_slots[0].innerHTML;
            let temp = this._format(tmp, i);
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML = temp;
            this.appendChild(el);
        }

        if (this._private_slot_el && has_more) {
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML = `<div>Loadmore</div>`;
            this.appendChild(el);
        }
        console.log(this.private_items.length)
        this.private_items[this.private_items.length -1 - 6].classList.add("sgn-active")
    }
}
