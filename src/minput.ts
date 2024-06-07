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
    private _dset:{[key:string]: {[key:string]:any}} = {};
    private _evnt_data:{[key:string]:any} = {};
    private _isNum = (spec:{[key:string]:string}) => ['n', 'num', 'number']
        .indexOf((spec['type'] || '').toLowerCase()) >= 0;
    private _getItemSpec(iname:string):{[key:string]:any} {
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
            if (this._dset[iname]['choices']) {
                this._dset[iname]['choices'] = this._dset[iname]['choices'].split(",");
                if (!this._dset[iname]['chars']) {
                    let max_len = this._dset[iname]['choices'][0].length;
                    for (let i = 0; i < this._dset[iname]['choices'].length; i++)
                        max_len = Math.max(this._dset[iname]['choices'][i].length, max_len)
                    this._dset[iname]['chars'] = max_len;
                }
            }
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
    @keydown=${this._keyDownEvent} @click=${this._clickEvent}
    value=${data['choices']?.length?data['choices'][0]:null}
    autocomplet="off"/>
${when(data['sepnxt'] && !is_last, () => html`<div style=${styleMap(sep_styles)}>${data['sepnxt']}</div>`)}
`
    }
    private _resetChoiceVal(el:HTMLInputElement) {
        if (el.dataset?.val)
            el.setAttribute("data-val", "");
    }
    private _choicesKeyDown(event:KeyboardEvent, data:{[key:string]:any},
                            is_visible_key:boolean) {
        event.preventDefault();
        if (!is_visible_key)
            return false;
        let el = event.target as HTMLInputElement;
        let val = el.dataset?.val || "";
        for (let i = 0; i < data['choices'].length; i++) {
            if (data['choices'][i].toLowerCase().indexOf((val + event.key).toLowerCase()) == 0) {
                el.value = data['choices'][i];
                break;
            }
        }
        el.setAttribute("data-val", val + event.key);
        return false
    }
    private _clickEvent(event:PointerEvent) {
        (event.target as HTMLInputElement).select();
    }
    private _keyDownEvent(event:KeyboardEvent) {
        let el = event.target as HTMLInputElement;
        let ix = +(el.dataset?.ix || -1)
        let inp_el = this.input_els[ix];
        let nxt_ix = (ix == this._items.length - 1)?0:(ix + 1);
        let prev_ix = (ix == 0)?this._items.length - 1:(ix - 1);
        let ss = inp_el.selectionStart as number;
        let data = this._getItemSpec(inp_el.id);

        if (event.key == 'ArrowRight' || event.key == 'Delete') {
            if (ss == inp_el.value.length || (event.key == 'ArrowRight' && data['choices']?.length)) {
                if (ix - nxt_ix > 0 && event.key == 'Delete') {
                    event.preventDefault();
                    return false;
                }
                let nxt_el = this.input_els[nxt_ix];
                nxt_el.focus();
                nxt_el.selectionStart = nxt_el.selectionEnd = 0;
                if (event.key == 'ArrowRight')
                    event.preventDefault();
            } else if (data['choices']?.length && event.key == 'Delete') {
                inp_el.value = data['choices'][0];
                this._resetChoiceVal(inp_el);
                event.preventDefault();
            }
        } else if (event.key == 'ArrowLeft' || event.key == 'Backspace') {
            if (ss == 0 || (event.key == 'ArrowLeft' && data['choices']?.length)) {
                if (ix - prev_ix < 0 && event.key == 'Backspace') {
                    event.preventDefault();
                    return false;
                }
                let prev_el = this.input_els[prev_ix]
                prev_el.focus();
                prev_el.selectionStart = prev_el.selectionEnd = prev_el.value.length;
                if (event.key == 'ArrowLeft')
                    event.preventDefault();
            } else if (data['choices']?.length && event.key == 'Backspace') {
                inp_el.value = data['choices'][0];
                event.preventDefault();
                this._resetChoiceVal(inp_el);
            }
        } else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
            let cur_val = +inp_el.value
            if (data['choices']?.length) {
                let val = inp_el.value;
                let ix = data['choices'].indexOf(val);
                if (event.key == 'ArrowDown')
                    inp_el.value = data['choices'][ix == data['choices'].length - 1?0:ix + 1];
                else
                    inp_el.value = data['choices'][ix == 0?data['choices'].length - 1:ix - 1];
            } else {
                if (isNaN(cur_val)) return;
                if (event.key == 'ArrowUp' &&
                    (!data['nmax'] || (data['loop'] == '1' && data['nmin']) || cur_val <= (+data['nmax'] - 1)) &&
                    (!data['chars'] || (""+ (cur_val + 1)).length <= +data['chars'])) {
                    if (data['loop'] == '1' && data['nmin'] && data['nmax'] && cur_val >= +data['nmax'])
                        cur_val = +data['nmin'] - 1;
                    inp_el.value = "" + (cur_val + 1);
                } else if (event.key == 'ArrowDown' &&
                        (!data['nmin'] || (data['loop'] == '1' && data['nmax']) || cur_val >= (+data['nmin'] + 1)) &&
                        (!data['chars'] || ("" + (cur_val - 1)).length <= +data['chars'])) {
                    if (data['loop'] == '1' && data['nmin'] != null && data['nmax'] && cur_val <= +data['nmin'])
                        cur_val = +data['nmax'] + 1;
                    inp_el.value = "" + (cur_val - 1);
                }
            }
            this._raiseEvent(inp_el, data);
        } else {
            let is_visible_key = event.key.length == 1 && event.key.match(
                /^[A-Za-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/g) != null;
            if (data['choices']?.length) {
                return this._choicesKeyDown(event, data, is_visible_key);
            }
            if (inp_el.selectionStart != inp_el.selectionEnd)
                return true;

            if (is_visible_key) {
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
        this._resetChoiceVal(el)
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
            if (!this.input_els[i])
                continue
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
