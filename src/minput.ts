import {LitElement, css, html, PropertyValues} from 'lit';
import {styleMap} from 'lit-html/directives/style-map.js';
import {map} from 'lit-html/directives/map.js';
import {when} from 'lit-html/directives/when.js';
import {customElement, property, queryAll} from 'lit/decorators.js';

import {parseAttrVal} from "./utils";

@customElement('aalam-minput')
export class AalamManagedInputElement extends LitElement {
    @property({type: String, attribute:true})
    order:String = "";

    @property({type: String, attribute:true})
    value:string = "";

    @queryAll(".fld")
    input_els:Array<HTMLInputElement>;

    private _items:string[] = [];
    private _dset:{[key:string]: {[key:string]:string}} = {};
    private _evnt_data:{[key:string]:any} = {};
    private _isNum = (spec:{[key:string]:string}) => ['n', 'num', 'number']
        .indexOf((spec['type'] || '').toLowerCase()) >= 0;
    private _getItemSpec(iname:string):{[key:string]:string} {
        let dkey = iname;
        if (!(iname in this._dset)) {
            if (!this.dataset[dkey]) {
                for (let k of Object.keys(this.dataset)) {
                    if (k[k.length - 1] == '*' &&
                        iname.startsWith(k.substr(0, k.length - 1))) {
                        dkey = k;
                        break
                    }
                }
                if (!this.dataset[dkey]) {
                    console.warn("No data attribute set for ", iname);
                    return this._dset[iname] = {}
                }
            }
            let dval:string = this.dataset[dkey] || '';
            this._dset[iname] = parseAttrVal(dval)
        }
        return this._dset[iname];
    }
    private _itemHtml(item:string, index:number) {
        let data = this._getItemSpec(item);
        let is_last = index == (this._items.length - 1);
        let style_map:{[key:string]:string} = {}
        if (data['chars'])
            style_map['width'] = `${+data.chars + 1}ch`;
        if (data['gapnxt'] && !data['sepnxt'] && !is_last)
            style_map['margin-right'] = data['gapnxt'];
        let sep_styles:{[key:string]:string} = {}
        if (data['sepnxt']) {
            sep_styles['display'] = 'inline-block';
            sep_styles['width'] = data['gapnxt'];
            sep_styles['text-align'] = 'center';
        }
        return html`
<input id="${item}" part="inp-field" class="fld" data-ix="${index}"
    type="${data.type == 'text'?'text':'tel'}" style=${styleMap(style_map)}
    placeholder="${data.ph}" @input=${this._inputEvent} @blur=${this._blurEvent}
    @keydown=${this._inputKeyEvent} @click=${this._clickEvent}
    autocomplet="off"/>
${when(data['sepnxt'] && !is_last, () => html`<div style=${styleMap(sep_styles)}>${data['sepnxt']}</div>`)}
`
    }
    private _clickEvent(event:PointerEvent) {
        (event.target as HTMLInputElement).select();
    }
    private _inputKeyEvent(event:KeyboardEvent) {
        let el = event.target as HTMLInputElement;
        let ix = +(el.dataset?.ix || -1)
        let inp_el = this.input_els[ix];
        let nxt_ix = (ix == this._items.length - 1)?0:(ix + 1);
        let prev_ix = (ix == 0)?this._items.length - 1:(ix - 1);
        let ss = inp_el.selectionStart as number;

        if (event.key == 'ArrowRight' || event.key == 'Delete') {
            if (ss == inp_el.value.length) {
                let nxt_el = this.input_els[nxt_ix];
                nxt_el.focus();
                nxt_el.selectionStart = nxt_el.selectionEnd = 0;
                if (event.key == 'ArrowRight')
                    event.preventDefault();
            }
        } else if (event.key == 'ArrowLeft' || event.key == 'Backspace') {
            if (ss == 0) {
                let prev_el = this.input_els[prev_ix]
                prev_el.focus();
                prev_el.selectionStart = prev_el.selectionEnd = prev_el.value.length;
                if (event.key == 'ArrowLeft')
                    event.preventDefault();
            }
        } else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
            let data = this._getItemSpec(inp_el.id);
            let cur_val = +inp_el.value
            if (isNaN(cur_val)) return;
            if (event.key == 'ArrowUp' &&
                (!data['nmax'] || cur_val <= (+data['nmax'] - 1)) &&
                (!data['chars'] || (""+ (cur_val + 1)).length <= +data['chars']))
                inp_el.value = "" + (cur_val + 1);
            else if (event.key == 'ArrowDown' &&
                    (!data['nmin'] || cur_val >= (+data['nmin'] + 1)) &&
                    (!data['chars'] || ("" + (cur_val - 1)).length <= +data['chars']))
                inp_el.value = "" + (cur_val - 1);
            this._raiseEvent(inp_el, data);
        } else {
            let data = this._getItemSpec(inp_el.id);
            if (inp_el.selectionStart != inp_el.selectionEnd)
                return true;

            if (event.key.match(/^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/g)) {
                let o = inp_el.value;
                let limit_crossed = this._isNum(data) && data['nmax'] &&
                                    +data['nmax'] < +(o.slice(0, ss) +
                                                      event.key +
                                                      o.slice(ss))
                if (inp_el.value.length >= +data['chars'] || limit_crossed) {
                    event.preventDefault();
                    return false;
                }
            }
        }
        return true;
    }
    private _raiseEvent(el:HTMLInputElement, spec:{[key:string]:string}) {
        let fld = el.id;
        let is_num = this._isNum(spec)
        if (this._evnt_data[fld] == (is_num?+el.value:el.value))
            return;
        let old_val = this._evnt_data[fld];
        this._evnt_data[fld] = is_num?el.value:el.value;
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            cancelable: true,
            detail: {
                changed: fld,
                old_val: old_val,
                new_val: this._evnt_data[fld],
                all: {...this._evnt_data}
            }
        }))
        this.value = this._items.map(
            i => `${i}:${this._evnt_data[i] || ''}`).join(";");
    }
    private _blurEvent(event:FocusEvent) {
        let el = event.target as HTMLInputElement;
        /* We raise event here, so that the event wasnt raised due to limitation in the 
         * character limit while key input event, but the input is focussed out.
         */
        this._raiseEvent(el, this._getItemSpec(el.id));
    }
    private _inputEvent(event:KeyboardEvent) {
        let etgt = event.target as HTMLInputElement;
        let cur_fld = etgt.id;
        let ix = +(etgt.dataset?.ix || -1);
        let nxt_ix = (ix == this._items.length - 1)?0:(ix + 1);

        let cur_data = this._getItemSpec(cur_fld);
        let cur_el:HTMLInputElement = etgt;
        let is_num = this._isNum(cur_data);
        let limit_crossed = is_num && cur_data['nmax'] && +cur_data['nmax'] < +(cur_el.value + '0')
        if (cur_el.value.length >= +cur_data['chars'] || limit_crossed) {
            if (limit_crossed && cur_el.value.length > +cur_data['chars'])
                cur_el.value = cur_data['nmax'];
            else if (is_num && cur_data['nmin'] && +cur_el.value < +cur_data['nmin'])
                cur_el.value = cur_data['nmin'];
            let nxt_el = this.input_els[nxt_ix];
            nxt_el.focus();
            nxt_el.select();
            this._raiseEvent(cur_el, cur_data);
        }
    }
    private _valueChanged() {
        let obj = parseAttrVal(this.value);
        for (let i in this._items) {
            let fld = this._items[i];
            let val = obj[fld] || '';
            this._evnt_data[fld] = this._isNum(
                this._getItemSpec(fld))?+val:val;
            this.input_els[i].value = obj[fld] || '';
        }
    }
    constructor() {
        super();
    }
    override attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'order') {
            this._items = new_val.split(",").map((x:string) => x.trim());
        } else if (name == 'value') {
            if (this.input_els.length > 0)
                this._valueChanged();
        }
    }
    override connectedCallback() {
        super.connectedCallback();
    }
    override render() {
        return html`
${map(this._items, (item, index) => this._itemHtml(item, index))}
`
    }
    static override get styles() {
        return css`
:host {display:inline-block;}
input,input:focus {border:0;padding:0;outline:0;}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;margin: 0;
}
input[type=number] {-moz-appearance: textfield;}
`
    }
    override firstUpdated(arg:PropertyValues) {
        super.firstUpdated(arg);
        if (this.value)
            this._valueChanged();
    }
    public get valdata() {
        return {...this._evnt_data}
    }
}
