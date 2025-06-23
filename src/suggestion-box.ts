import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { queryAssignedElements } from "lit/decorators.js";

@customElement("aalam-sgn-box")
export class AalamSuggestionBox extends LitElement {
    @queryAssignedElements({ slot: "sgn-item-template" })
    template_slots: Array<HTMLElement>;

    @queryAssignedElements({ slot: "__private-item" })
    private_items: Array<HTMLElement>;

    @queryAssignedElements({ slot: "sgn-loadmore" })
    loadmore_slot: Array<HTMLElement>;

    @queryAssignedElements({ slot: "sgn-empty" })
    empty_slot: Array<HTMLElement>;

    @queryAssignedElements({ slot: "sgn-nomatch" })
    nomatch_slot: Array<HTMLElement>;

    @property({ type: Array<Object> })
    list: Array<{ [key: string]: any } | string> = [];

    @property()
    listkey: string = "";

    @property()
    minchar: number = 1;

    @property()
    highlight: string = "";

    @property()
    activecls: string = "sgn-active";

    @property()
    closesel:string = ".dd-close";

    @state()
    result: Array<{ [key: string]: string } | string | any> = [];

    @state()
    input_el: HTMLElement | null | string = null;

    @state()
    filtered_list: Array<{ [key: string]: string } | string> = [];

    @state()
    prevIndex: number = 0;

    @state()
    show_container = false;

    @state()
    has_more: boolean = false;

    @state()
    index: number = -1;

    @state()
    show_nomatch: boolean = false;

    @state()
    show_empty: boolean = true;

    @state()
    screenx: number = 0;

    @state()
    screeny: number = 0;

    private _templateContent: string = "";
    private _actual_inp_value:string;
    private _outClickListener = this.windowClickEvent.bind(this);

    override connectedCallback() {
        super.connectedCallback();
        document.addEventListener("click", this._outClickListener);
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("click", this._outClickListener);
    }
    override render() {
        return html`
            <div style="position:relative">
                <div  part="sgn-input" @focusin=${this._inputFocusEvent} @focusout=${this._inputBlurEvent} @keydown=${this.keyDownInputEvent} >
                    <slot name="sgn-input" id="sgn-input" @input=${this._inputEvent} @click=${this._inputClickEvent} @select=${this._inputSelectEvent}>
                        <input part="sgn-input" type="text" />
                    </slot>
                </div>
                <slot name="sgn-item-template" @slotchange=${this._slotChanged} style="display:none"></slot>
                <div id="sgn-container" part="sgn-container" style="display:${this.show_container ? "block" : "none"};position:absolute;left:0;right:0">
                    <div style="display:${this.show_empty ? "block" : "none"}">
                        <slot id="sgn-empty" name="sgn-empty"></slot>
                    </div>
                    <div style="display:${this.show_nomatch ? "block" : "none"}" @click=${this._noMatchSuggestionClickedEvent}>
                        <slot id="sgn-nomatch" name="sgn-nomatch"></slot>
                    </div>
                    <div style="display:${!this.show_empty ? "block" : "none"};" @click=${this._itemClickedEvent} @mouseover=${this._mouseOverEvent} @mouseout=${this._mouseOutEvent}>
                        <slot id="private-item" name="__private-item"></slot>
                    </div>
                    <div style="display:${this.has_more ? "block" : "none"}" id="loadmore" @click=${this._itemClickedEvent} @mouseover=${this._mouseOverEvent} @mouseout=${this._mouseOutEvent} >
                        <slot name="sgn-loadmore" id="sgn-loadmore"></slot>
                    </div>
                </div>
            </div>
        `;
    }
    private _noMatchSuggestionClickedEvent(e:Event) {
        e.stopPropagation();
        if(this.closesel && (e.target as HTMLElement).matches(this.closesel))
            this.show_container = false;
    }
    private _slotChanged() {
        const template = this.template_slots[0];
        if (template) {
            this._templateContent = template.innerHTML;
        }
    }

    private _indexOfTarget(event: any) {
        let el = event.target;
        while (el) {
            if (el.slot == "__private-item")
                return this.private_items.indexOf(el);
            else if (el.slot == "sgn-loadmore") return this.result.length;
            el = el.parentElement;
        }
        return -1;
    }
    private _mouseOverEvent(e: any) {
        if (e.clientX == this.screenx && e.clientY == this.screeny) return;
        let curr_index = this._indexOfTarget(e);
        this.screenx = e.clientX;
        this.screeny = e.clientY;
        this.index = curr_index;
        if (curr_index == -1) return;

        if ( curr_index === this.result.length - 1 + (this.has_more ? 1 : 0) && this.has_more) {
            this.loadmore_slot[0].classList.add(`${this.activecls}`);
        }

        if (curr_index >= 0 && curr_index < this.result.length) {
            this.private_items[this.index].classList.add(`${this.activecls}`);
        }
        if ( curr_index >= 0 && curr_index < this.result.length && this.has_more) {
            this.loadmore_slot[0].classList.remove(`${this.activecls}`);
        }
        if ( this.private_items.length > 0 && curr_index !== this.private_items.length - 1) {
            this.private_items[this.private_items.length - 1].classList.remove(
                `${this.activecls}`
            );
        }
        this.prevIndex = curr_index;
        this._scrollIntoView();
    }

    private _scrollIntoView() {
        const selectedItem = this.private_items[this.index];
        const loadmore = this.loadmore_slot[0];

        if (selectedItem) {
            selectedItem.scrollIntoView({
                behavior: "instant",
                block: "nearest",
            });
        } else if (loadmore && this.index === this.result.length) {
            loadmore.scrollIntoView({
                behavior: "instant",
                block: "nearest",
            });
        }
    }

    private _inputClickEvent() {
        this.index = -1;
    }

    private _inputSelectEvent(event:Event) {
        event.stopPropagation();
    }

    private _inputBlurEvent(event:any) {
        if (event.relatedTarget && event.relatedTarget?.closest('aalam-sgn-box') != this) {
            this.show_container = false;
            this.index = -1;
        }
    }

    private _inputFocusEvent() {
        this.show_container = (this.empty_slot.length > 0 || this.filtered_list.length > 0 && (this.input_el as HTMLInputElement)?.value.length >= this.minchar );
        this.index = -1;
    }

    private _mouseOutEvent(e: any) {
        if (e.clientX == this.screenx && e.clientY == this.screeny) return;
        if (this.prevIndex >= 0 && this.prevIndex < this.result.length) {
            this.private_items[this.index]?.classList.remove(
                `${this.activecls}`
            );
        }
    }
    windowClickEvent(event: any) {
        let el = event.target;
        if (el.closest('aalam-sgn-box') != this) {
            this.show_container = false
            this.index = -1;
        }
    }

    private _highlightSelect(value: string) {
        let text =
            this.highlight === "matched"
                ? this._highlightMatched(value)
                : this.highlight === "end"
                ? this._highlightEnd(
                      value,
                      (this.input_el as HTMLInputElement)?.value.toLowerCase()
                  )
                : value;
        return text;
    }

    private _format(obj: any) {
        if (!this._templateContent) return "";

        let str = this._templateContent;
        str = str.replace(/\{([^}]+)\}/g, (_, key) => {
            let keyval = key.trim();
            if (obj.hasOwnProperty(keyval)) {
                const value = obj[keyval];
                if (key.trim() === this.listkey) {
                    return this._highlightSelect(value);
                } else {
                    return value;
                }
            } else {
                return "";
            }
        });

        return str;
    }
    keyDownInputEvent(e: any) {
        const resultLength = this.result.length;
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                this.index =
                    this.index < 0
                        ? resultLength - 1 + (this.has_more ? 1 : 0)
                        : this.index - 1;
                this._setActive(resultLength);

                break;
            case "ArrowDown":
                this.index =
                    (this.index + 1) % (resultLength + (this.has_more ? 1 : 0));
                if (this.index < this.prevIndex)
                    this.index = -1;
                this._setActive(resultLength);

                break;
            case "Enter":
                if (this.index === resultLength) {
                    this._loadmoreEntry(e);
                } else if (this.index >= 0 && this.index <= resultLength) {
                    this._setInputEvent(this.index);
                }

                break;
        }
    }

    private _inputEvent(e: any) {
        e.stopPropagation();
        let min_char = Number(this.minchar);

        this.index = -1;
        this.input_el = e.target;
        this._actual_inp_value = (this.input_el as HTMLInputElement)?.value;

        if ((this.input_el as HTMLInputElement).value !== "") {
            this.show_nomatch = false;
        }
        const previousMatchElement = this.querySelector(".sgn-match");
        if (previousMatchElement) {
            previousMatchElement.remove();
        }
        if (Array.isArray(this.list) && this.list.length > 0) {
            if (this._actual_inp_value) {
                this.filtered_list = this.list.filter((item) =>
                    this._isMatching(item, this._actual_inp_value)
                );
                this.setSuggestions(this.filtered_list, false);
            } else {
                this.show_empty = true;
                if (this._actual_inp_value.length == 0)
                    this.show_container = this.empty_slot.length > 0;
            }
        }
        const input = new CustomEvent("input", {
            bubbles: true,
            composed: true,
            detail: {list: this.filtered_list, value: this._actual_inp_value}
        });
        let ev_ret = this.dispatchEvent(input);
    }

    private _isMatching(item: any, value: string): boolean {
        let _search = (x:string, y:string) => {
            return x.replace(/[ ./]/g, '').search(new RegExp(y.replace(/[ ./]/g, ''), 'i')) != -1;
        }
        if (typeof item === "string") {
            return _search(item, value);
        } else if (typeof item === "object") {
            if (
                this.listkey &&
                item.hasOwnProperty(this.listkey) &&
                typeof item[this.listkey] === "string"
            ) {
                return _search(item[this.listkey], value);
            } else {
                for (let key in item) {
                    if (
                        typeof item[key] === "string" &&
                        _search(item[key], value)
                    ) {
                        return true;
                    }
                }
                return false;
            }
        }
        return false;
    }

    private _setActive(resultLength: number) {
        if (this.index < resultLength) {
            if (this.index < 0) {
                (this.input_el as HTMLInputElement).value = this._actual_inp_value;
            } else {
                if (typeof this.result[this.index] == "string") {
                    (this.input_el as HTMLInputElement).value =
                        this.result[this.index];
                } else {
                    (this.input_el as HTMLInputElement).value =
                        this.result[this.index][this.listkey];
                }
            }
        }

        if (this.prevIndex >= 0 && this.prevIndex < resultLength) {
            this.private_items[this.prevIndex]?.classList.remove(
                `${this.activecls}`
            );
        } else if (this.prevIndex === resultLength && this.has_more) {
            this.loadmore_slot[0]?.classList.remove(`${this.activecls}`);
        }

        if (this.index >= 0 && this.index < resultLength) {
            const selectedItem = this.private_items[this.index];
            if (selectedItem) {
                selectedItem.classList.add(`${this.activecls}`);
            }
        } else if (this.index === resultLength && this.has_more) {
            this.loadmore_slot[0]?.classList.add(`${this.activecls}`);
            (this.input_el as HTMLInputElement).value = this._actual_inp_value;
        }

        this.prevIndex = this.index;
        this._scrollIntoView();
    }

    private _itemClickedEvent(event: Event) {
        let indextarget = this._indexOfTarget(event);

        if (this.result[indextarget]) {
            this._setInputEvent(indextarget);
        } else if (indextarget === this.result.length && this.has_more) {
            this.loadmore_slot[0].classList.remove(`${this.activecls}`);
            this._loadmoreEntry(event);
        }
        let ev = event.target as HTMLElement;
        if(ev.closest(this.closesel))
            this.show_container = false;
    }

    private _setInputEvent(index: number) {
        let selectedValue: any;
        if (typeof this.result[index] === "string") {
            selectedValue = this.result[index];
        } else {
            selectedValue = this.result[index][this.listkey];
        }
        if (selectedValue) {
            (this.input_el as HTMLInputElement).value = selectedValue;
            this.show_container = false;
        }

        this.dispatchEvent(
            new CustomEvent("select", {
                detail: this.result[index],
                bubbles: true,
                cancelable: false,
                composed: true,
            })
        );
        this._scrollIntoView();
    }

    private _highlightEnd(text: string, match_str: string) {
        if (!match_str) return text;
        const matchStartIndex = text
            .toLowerCase()
            .indexOf(match_str.toLowerCase());
        if (matchStartIndex === -1) {
            return text;
        }
        const matchEndIndex = matchStartIndex + match_str.length;
        return (
            text.substring(0, matchEndIndex) +
            "<strong>" +
            text.substring(matchEndIndex) +
            "</strong>"
        );
    }

    _highlightMatched(name: any) {
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
        return name.replace(re, `<strong class="sgn-highlight">$1</strong>`);
    }
    public setSuggestions ( suggestions: Array<{ [key: string]: string } | string>, has_more: boolean) {
        this.result = [...suggestions];
        this.index = -1;

        (this.input_el as HTMLInputElement)?.value
            ? (this.show_empty = false)
            : (this.show_empty = true);
        this.has_more = has_more;
        if (this.private_items?.length) {
            for (let el of this.private_items) el.remove();
        }
        this.filtered_list = suggestions;
        this.show_nomatch =
            this.input_el &&
            (this.input_el as HTMLInputElement).value.length >= this.minchar &&
            !this.result.length
                ? true
                : false;
        this.show_container = (this.show_nomatch && this.nomatch_slot.length > 0) ||
                              (this.result.length > 0) ||
                              (this.show_empty && this.empty_slot.length > 0);
        this._processedSuggestion(suggestions, has_more);
    }

    private _loadmoreEntry(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        const loadmore = new CustomEvent("loadmore", {
            bubbles: true,
            detail: {last: this.result[this.result.length - 1]}
        });
        this.has_more = false;
        this.loadmore_slot[0].classList.remove(`${this.activecls}`);
        this.dispatchEvent(loadmore);
    }

    public appendSuggestions( suggestions: Array<{ [key: string]: string }>, has_more: boolean = false ) {
        this.result = [...this.result];
        this.result.push(...suggestions);
        this.has_more = has_more;
        this._processedSuggestion(suggestions, has_more);
    }

    private _processedSuggestion(
        suggestions: Array<{ [key: string]: string } | string>,
        _has_more: boolean
    ) {
        for (let i of suggestions) {
            if (typeof i === "string") {
                i = { [this.listkey]: i };
            }

            let el = document.createElement("div");
            el.className = "sgn-item";
            el.slot = "__private-item";
            el.innerHTML =
                i.html ||
                (this.template_slots[0] == null || undefined
                    ? this._highlightSelect(i[this.listkey])
                    : this._format(i));
            this.appendChild(el);
            if (this.index > 0)
                this.private_items[this.index].classList.add(
                    `${this.activecls}`
                );
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'aalam-sgn-box': AalamSuggestionBox;
    }
}
export default AalamSuggestionBox;
