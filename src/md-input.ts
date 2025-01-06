import {LitElement, html, css} from 'lit';
import {state, customElement, property, query, queryAssignedElements}
    from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

@customElement('aalam-md-input')
export class AalamMdInput extends LitElement {

    @property({type:String, attribute:true})
    label = "Label";

    @property({type:String, attribute:true})
    mode = 'filled';

    @property({type:String, attribute:true})
    color = 'currentColor';

    @property({type:Boolean, attribute:true})
    disabled = false;

    @property({type:String, attribute:true})
    override prefix = "";

    @property({type:String, attribute:true})
    suffix = "";

    @property({type:Number, attribute:true})
    charcount = '';

    @property({type:String, attribute:true})
    value = '';

    @state()
    private _num_leading_icons:number;

    @state()
    private _num_trailing_icons:number;

    @state()
    private _helper_text_slotted:boolean;

    @query('#_container')
    _container:HTMLElement;

    @query('#_input-box')
    _input_box:HTMLInputElement;

    @query("#_display-counter")
    _display_counter:HTMLElement;

    @queryAssignedElements({ slot: 'input' })
    _input_slot:Array<HTMLInputElement>;

    @queryAssignedElements({ slot: 'leading-icon' })
    _leading_icon_slot:Array<HTMLInputElement>;

    @queryAssignedElements({ slot: 'trailing-icon' })
    _trailing_icon_slot:Array<HTMLInputElement>;

    private _input_element:HTMLInputElement;

    constructor() {
        super();
    }
    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'disabled')
            this._disableInput();
        else if(name == 'charcount')
            this._charCounter();
        else if(name == 'mode') {
            if(this.mode != 'outline' && this.mode != 'filled' && this.mode != 'normal') {
                this.mode = 'filled';
            }
        } else if (name == 'value') {
            this._input_element.value = new_val;
            if (!new_val?.length)
                this._blurEvent();
            else
                this.__updateFocus();
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", (e) => {
            this._slotChangedEvent(e);
        });
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
    }
    override render() {
        return html`
${when(this.mode == 'normal', () => html`<slot name="normal-label">
    <label>${this.label}</label>
</slot>`)}
<div id="_container" part="container" class="mode-${this.mode}"
    @click=${this._clickEvent}
    style="--attrcolor:${this.color}">
    <div class="${!this._num_leading_icons?'hide':''}">
        <slot name="leading-icon"></slot>
    </div>
    <div id="_input-container" class="mode-${this.mode}">
        ${when(this.prefix, () =>
            html`<span id="_prefix">${this.prefix}</span>`)}
        <span id="_input-span" @input=${this._charCounter}>
            <slot name="input">
                <input id="_input-box" type="text"
                    @focus=${this._focusEvent}
                    @blur=${this._blurEvent}>
            </slot>
        </span>
        ${when(this.suffix, () =>
            html`<span id="_suffix">${this.suffix}</span>`)}
        ${when(this.mode != 'normal', () => html`<span id="_label" part="label">${this.label}</span>`)}
    </div>
    <div class="${(this._num_trailing_icons || (!this._helper_text_slotted && this.charcount))?'':'hide'}">
        <slot name="trailing-icon"></slot>
        ${when(this.charcount && !this._helper_text_slotted && !this._num_trailing_icons, () => html`<span id='_display-counter' part="charcount"></span>`)}
    </div>
</div>
<div id="_helper-text">
    <slot name="helper-text"></slot>
    ${when(this._num_trailing_icons || this._helper_text_slotted, () => html`
    <span id='_display-counter' part="charcount"></span>
    `)}
</div>`
    }
    static override get styles() {
        return css`
var(--attrcolor);}
:host {position:relative;display:block;width:100%}
#_container {
    position:relative;display:flex;align-items:center;
    gap:5px;padding-left:5px;padding-right:5px}
#_input-container {
    position:relative;padding-top:calc(0.75em + 7px);padding-bottom:3px;
    gap:5px;padding-right:5px;
    display:flex;align-items:center;flex:1}
#_input-container.mode-normal {padding-top:0;padding-bottom:0;}
#_label {
    position:absolute;top:50%;left:0;
    transition:all 0.2s ease;transform:translateY(-50%)}
#_prefix, #_suffix {opacity:0}
#_input-span {flex:1;display:inline-flex;}
#_helper-text {display:flex;padding-left:5px}
#_display-counter {display:flex;margin-left:auto}
::slotted([slot=input]), #_input-box {
    background:transparent;outline:none;
    border:none;width:100%;padding:0px;font-size:1em}
.focused #_prefix, .focused #_suffix {opacity:1}
.hide {display:none;}
.mode-filled {backdrop-filter:brightness(0.90)}
.mode-filled:hover {backdrop-filter:brightness(0.80)}
.mode-filled.focused {backdrop-filter:brightness(0.70)}
.mode-filled.focused #_label {
    transform:translateY(calc(-100% - 2px)) scale(0.75);transform-origin:left}
.mode-filled.focused {border-bottom:solid 2px var(--attrcolor)}
.mode-filled.focusout {border-bottom:transparent !important}
.mode-filled.focusout {backdrop-filter:brightness(0.90)}

#_container.mode-normal {border:1px solid var(--attrcolor);}

#_container.mode-outline.focused {
    border:solid 2px var(--attrcolor)}
#_container.mode-outline.focused #_input-container {
    padding:calc((0.75em + 10px)/2);padding-left:0px;padding-right:5px}
#_container.mode-outline, .mode-outline.focusout {border:solid 2px grey}
#_container.mode-outline.focused #_label {
    padding:4px;background:white;
    transform-origin:left;
    top:0;
    transform:translateY(-50%) translateX(calc(var(--tx, 0)*-1px)) scale(0.75)}`
    }
    override firstUpdated() {
        if(this._input_slot[0])
            this._input_element = this._input_slot[0];
        else
            this._input_element = this._input_box;
        this._input_element.value = '';
        if(this.charcount)
            this._charCounter();
        this._setTransX();
        this._disableInput();
    }
    private _slotChangedEvent(e:Event) {
        if(!e.target)
            return;
        let name = (e.target as HTMLSlotElement)?.name;
        if(name == 'input') {
            if(!this._input_slot[0]) {
                if(this._input_element != this._input_box)
                    this._input_element = this._input_box;
                return;
            }
            if(this._input_element != this._input_slot[0])
                this._input_element = this._input_slot[0];
            this._input_element.addEventListener("focus", () => {
                this._focusEvent()});
            this._input_element.addEventListener("blur", () => {
                this._blurEvent()});
        } else if(name == 'leading-icon') {
            this._num_leading_icons = this._leading_icon_slot.length;
            this._setTransX();
        } else if (name == 'trailing-icon') {
            this._num_trailing_icons = this._trailing_icon_slot.length;
        } else if (name == 'helper-text') {
            this._helper_text_slotted = true;
        }
    }
    private _clickEvent() {
        if(this.disabled)
            return;
        this._input_element.focus();
    }
    private __updateFocus() {
        this._container.classList.add('focused');
        this._container.classList.remove('focusout');
    }
    private _focusEvent() {
        if(this.disabled)
            return
        this.__updateFocus();
    }
    private _blurEvent() {
        if(!this._input_element.value)
            this._container.classList.remove('focused');
        else
            this._container.classList.add('focusout');
    }
    private _charCounter() {
        if(!this._input_element)
            return;
        if(!this.charcount) {
            this._display_counter.innerText = '';
            this._display_counter.style.display = 'none';
            this._input_element.removeAttribute('maxlength');
            return;
        }
        this._display_counter.style.display = 'flex';
        this._input_element.setAttribute('maxlength', this.charcount);
        let size = (this._input_element.value).length;
        this._display_counter.innerText = `${size}/${this.charcount}`;
    }
    private _disableInput() {
        if(!this._input_element)
            return;
        if(this.disabled == true)
            this._input_element.setAttribute('disabled', '');
        else
            this._input_element.removeAttribute('disabled');
    }
    private _setTransX() {
        let inp_cont = this.shadowRoot?.querySelector('#_input-container');
        let cont_x = inp_cont?.getBoundingClientRect().x;
        if(cont_x) {
            let this_x = this.getBoundingClientRect().x;
            this.style.setProperty('--tx', `${cont_x - this_x - 4}`);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-md-input":AalamMdInput;
    }
}
