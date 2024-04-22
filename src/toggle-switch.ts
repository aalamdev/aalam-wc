import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('aalam-switch')
export class AalamSwitchElement extends LitElement {
    DEFAULT_STYLES:{ [key:string]: string } = {
        onColor: 'var(--primary-color)',
        offColor: 'grey',
        dialColor: '#fff',
        width: '50px',
        height: '26px'
    };
    static override properties = {
        style: {type: String, reflect:true}
    }

    @property({attribute: true, type:String, reflect:true})
    status = "off";

    @state()
    onColor = this.DEFAULT_STYLES.onColor;

    @state()
    offColor = this.DEFAULT_STYLES.offColor;

    @state()
    dialColor = this.DEFAULT_STYLES.dialColor;

    @state()
    width = this.DEFAULT_STYLES.width;

    @state()
    height = this.DEFAULT_STYLES.height;

    constructor() {
        super();
    }

    private _parseCSS(k:string, v:string) {
        try {
            CSSStyleValue.parse(k, v);
        } catch (err:any) {
            /*Some browsers doesnt support parse function*/
            return err['name'] != "TypeError";
        }
        return true;
    }
    private _parseCSSColor(v:string) {
        return this._parseCSS('color', v);
    }
    private _parseCSSDimension(v:string) {
        return this._parseCSS('width', v);
    }
    private _resetStyles() {
        this.onColor = this.DEFAULT_STYLES.onColor;
        this.offColor = this.DEFAULT_STYLES.offColor;
        this.dialColor = this.DEFAULT_STYLES.dialColor;
        this.width = this.DEFAULT_STYLES.width;
        this.height = this.DEFAULT_STYLES.height;
    }
    override attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'style') {
            this._resetStyles();

            for (let literal of new_val.split(";")) {
                let [n, v] = literal.trim().split(":").map(x => x.trim());
                if (n == "oncolor") {if (this._parseCSSColor(v)) this.onColor = v;}
                else if (n == "offcolor") {if (this._parseCSSColor(v)) this.offColor = v;}
                else if (n == "dialcolor") {if (this._parseCSSColor(v)) this.dialColor = v;}
                else if (n == "width") {if (this._parseCSSDimension(v)) this.width = v;}
                else if (n == 'height') {if (this._parseCSSDimension(v)) this.height = v;}
            }
        }
    }
    override render() {
        return html`
        <style>
        :host {display:inline-block;}
        .switch-dial {position:absolute;top:3px;bottom:3px;left:3px;right:calc(100% - ${this.height} - 3px);transition:all 0.1s ease;}
        :host([status='on']) .switch-dial {right:3px;left:calc(100% - ${this.height} + 3px);}
        .switch-container {height:${this.height};width:${this.width};
                           background-color:${this.offColor};
                           box-sizing:content-box;border-radius:${this.height};position:relative;cursor:pointer;}
        .switch-dial > svg {height:calc(${this.height} - 6px);width:calc(${this.height} - 6px);}
        :host([status='on']) .switch-container {background-color:${this.onColor};}
        </style>
        <div class="switch-container"   @click=${this._onClick}>
                <span class="switch-dial">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle r="45" cx="50" cy="50" fill="${this.dialColor}" />
                    </svg>
                </span>
            </div>
            `;
    }
    private _onClick() {
        this.status = (this.status == 'on')?'off':'on';
        let event = new CustomEvent('change', {
            bubbles: true,
            cancelable: true,
            detail: this.status,
        })
        this.dispatchEvent(event);
    }
}

declare global {
  interface HTMLElementTagNameMap {
    "aalam-switch": AalamSwitchElement;
  }
}
