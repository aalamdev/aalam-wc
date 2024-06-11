import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { queryAssignedElements } from "lit/decorators.js";

@customElement("aalam-sgn-box")
export class SuggestionBox extends LitElement {
    static override styles = css`
        :host {
            position: relative;
        }
    `;

    @property({ type: Array<Object> })
    list: Array<{ [key: string]: any }> = [];

    @property()
    listkey: string = "";

    @queryAssignedElements({ slot: "sgn-item-template" })
    template_slots: Array<HTMLElement>;

    @queryAssignedElements({ slot: "__private-item" })
    private_items: Array<HTMLElement>;

    @property()
    size: number = 0;

    @property()
    result: Array<{ [key: string]: string }> = [];

    @property()
    highlight: string = "";

    @property()
    input_el: HTMLElement | null = null;

    @property()
    filtered_list: Array<{ [key: string]: string }> = [];

    @property()
    prevIndex: number = 0;

    @property()
    minchar: number = 1;

    @state()
    show_container = false;

    @state()
    has_more: boolean = false;

    @state()
    index: number = -1;
    @state()
    show_empty: boolean = true;

    private _outClickListener = this.windowClickEvent.bind(this);

    override connectedCallback() {
        super.connectedCallback();
        this.addEventListener("mouseout", this._mouseOutEvent);
        document.addEventListener("click", this._outClickListener);
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("mouseout", this._mouseOutEvent);
        document.removeEventListener("click", this._outClickListener);
    }
    override render() {
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
                        id="sgn-input"
                        @input=${this._inputEvent}
                        @click=${this._inputSelectEvent}
                        ><input type="text" />
                    </slot>
                </div>
                <slot name="sgn-item-template" style="display:none"></slot>
                <div
                    id="sgn-container"
                    part="sgn-container"
                    style="display:${this.show_container ? "block" : "none"};"
                >
                    <div style="display:${this.show_empty ? "block" : "none"}">
                        <slot id="sgn-empty" name="sgn-empty"></slot>
                    </div>
                    <div
                        style="display:${!this.show_empty ? "block" : "none"};"
                        @click=${this._saveInputEvent}
                        @mouseover=${this._mouseOverEvent}
                    >
                        <slot id="private-item" name="__private-item"></slot>
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
    private _saveInputEvent(event: Event) {
        let indextarget = this._indexOfTarget(event);
        if (this.result[indextarget]) {
            (this.input_el as HTMLInputElement).value =
                this.result[indextarget][this.listkey];
            this.show_container = false;
        } else if (indextarget === this.result.length) {
            this._loadmoreEntry(event);
        }
    }
    private _mouseOverEvent(e: any) {
        let curr_index = 0;
        curr_index = this._indexOfTarget(e);
        this.index = curr_index;
        if (this.index >= 0) {
            const prevItem = this.private_items[this.index];
            if (prevItem) {
                prevItem.classList.remove("sgn-active");
            }
        }
        if (curr_index >= 0) {
            this.private_items[this.index].classList.add("sgn-active");
        }
        this.prevIndex = curr_index;
    }
    private _inputSelectEvent() {
        this.index = -1;
    }
    private _inputFocusEvent() {
        if (this.show_empty) this.show_container = true;
        this.index = -1;
    }
    private _mouseOutEvent() {
        if (this.prevIndex >= 0 && this.prevIndex < this.result.length) {
            this.private_items[this.index]?.classList.remove("sgn-active");
        }
    }
    windowClickEvent(event: any) {
        let el = event.target;
        while (el) {
            if (el == this) return;
            el = el.parentElement;
        }
        this.show_container = false;
    }
    private _format(str: any, obj: any, keys: string) {
        const input = (this.input_el as HTMLInputElement)?.value;
        if (typeof obj == "string" || typeof obj == "number") return obj;
        else {
            for (let key of Object.keys(obj)) {
                let template: any;
                if (key === keys) {
                    template =
                        this.highlight === "matched"
                            ? this._highlight(obj[key], input.toLowerCase())
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
                    this.index == -1
                        ? resultLength - 1 + (this.has_more ? 1 : 0)
                        : this.index - 1;

                this._setActive(resultLength);
                break;
            case "ArrowDown":
                this.index =
                    this.index === -1 ||
                    (this.has_more && this.index === resultLength)
                        ? 0
                        : (this.index + 1) %
                          (resultLength + (this.has_more ? 1 : 0));
                this._setActive(resultLength);
                break;
            case "Enter":
                if (this.index === resultLength) {
                    this._loadmoreEntry(e);
                } else {
                    this._setInputValue();
                }
                break;
        }
    }
    private _inputEvent(e: any) {
        this.index = -1;
        this.input_el = e.target;
        let min_char = Number(this.minchar);
        if ((this.input_el as HTMLInputElement)?.value.length >= min_char) {
            if (this.list) {
                if ((this.input_el as HTMLInputElement)?.value) {
                    this.filtered_list = this.list.filter((item) =>
                        item[this.listkey].includes(
                            (this.input_el as HTMLInputElement)?.value
                        )
                    );
                    this.setSuggestion(this.filtered_list, false, this.listkey);
                } else {
                    this.show_empty = true;
                }
            }
            const input = new CustomEvent("input", {
                bubbles: true , composed:true
            });
            this.dispatchEvent(input);
        } else {
            this.filtered_list = [];
            this.show_empty = true;
            this.setSuggestion(this.filtered_list, false, this.listkey);
        }
        return;
    }
    private _setActive(resultLength: number) {
        if (this.prevIndex >= 0 && this.prevIndex < resultLength) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove("sgn-active");
            }
        }
        if (this.index >= 0 && this.index < resultLength) {
            const selectedItem = this.private_items[this.index];

            if (selectedItem) {
                this.private_items[this.prevIndex]?.classList.remove(
                    "sgn-active"
                );
                selectedItem.classList.add("sgn-active");
            }
        } else if (this.index == resultLength && this.has_more) {
            this.private_items[this.index].classList.add("sgn-active");
            this.private_items[this.prevIndex]?.classList.remove("sgn-active");
        }

        this.prevIndex = this.index;
    }

    private _setInputValue() {
        const selectedValue = this.result[this.index][this.listkey] || this.result[this.index].name;
        if (selectedValue) {
            (this.input_el as HTMLInputElement).value = selectedValue;
            this.show_container = false;
        }
    }
    _highlight(name: any, input: string) {
        if (input && name.toLowerCase().includes(input)) {
            const parts = name.split(new RegExp(`(${input})`, "gi"));
            return parts
                .map((part: any, index: number) => {
                    if (index > 1) {
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
        const input_val = (this.input_el as HTMLInputElement)?.value;
        if (!input_val) {
            return name;
        }

        const escaped_input_val = input_val.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&"
        );
        const re = new RegExp(
            "(" + escaped_input_val.split(" ").join("|") + ")",
            "gi"
        );
        return name.replace(re, `<span class="sgn-highlight">$1</span>`);
    }
    setSuggestion(
        suggestions: Array<{ [key: string]: string }>,
        has_more: boolean,
        key: string
    ) {
        this.listkey = key;
        if ((this.input_el as HTMLInputElement)?.value.length >= this.minchar) {
            this.result = [...suggestions];
            this.index = -1;
            let input_temp: HTMLElement | null | string = null;
            input_temp = (this.input_el as HTMLInputElement)?.value;
            input_temp ? (this.show_empty = false) : (this.show_empty = true);
            this.has_more = has_more;
            if (this.private_items?.length) {
                for (let el of this.private_items) el.remove();
            }
            this.size = suggestions.length;
            this.filtered_list = suggestions;
            this.show_container = true;
            for (let i of suggestions) {
                let el = document.createElement("div");
                el.className = "sgn-item";
                el.slot = "__private-item";
                console.log("key value ", i);
                el.innerHTML =
                    i.html ||
                    (this.template_slots[0] == null || undefined
                        ? this.highlight == "matched"
                            ? this._startsWithHighlight(i[key])
                            : this._highlight(
                                  i[key],
                                  (this.input_el as HTMLInputElement)?.value
                              )
                        : this._format(
                              this.template_slots[0].innerHTML,
                              i,
                              key
                          ));
                this.appendChild(el);
            }
            if (has_more) {
                let el = document.createElement("div");
                el.className = "sgn-item";
                el.slot = "__private-item";

                el.innerHTML = `<div class="sgn-loadmore"><div>Loadmore</div></div>`;
                this.appendChild(el);
            }
            return this;
        } else {
            if (this.private_items?.length) {
                for (let el of this.private_items) el.remove();
            }
            return;
        }
    }

    private _loadmoreEntry(event: Event) {
        const loadmore = new CustomEvent("loadmore", {
            bubbles: true,
        });
        if (true) {
            this.private_items[this.private_items.length - 1].remove();
        }

        this.dispatchEvent(loadmore);
        event.stopPropagation();
    }

    appendSuggestion(
        suggestions: Array<{ [key: string]: string }>,
        has_more: boolean,
        key: string
    ) {
        this.result = [...this.result];
        this.result.push(...suggestions);
        this.has_more = has_more || false;
        this.size = this.size + suggestions.length;

        for (let i of suggestions) {
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML =
                i.html ||
                (this.template_slots[0] == null || undefined
                    ? this._startsWithHighlight(i[key])
                    : this._format(this.template_slots[0].innerHTML, i, key));
            this.appendChild(el);
        }

        if (has_more) {
            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML = `<div>Loadmore</div>`;
            this.appendChild(el);
        }
        if (has_more) {
            this.private_items[
                this.private_items.length - 1 - suggestions.length
            ].classList.add("sgn-active");
        } else {
            this.private_items[
                this.private_items.length - suggestions.length
            ].classList.add("sgn-active");
        }
    }
}
