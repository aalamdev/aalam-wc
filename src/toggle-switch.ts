import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('aalam-switch')
export class AalamSwitchElement extends LitElement {
    DEFAULT_STYLES:{ [key:string]: string } = {
        width: '28px',
        height: '16px'
    };
    static override properties = {
        style: {type: String, reflect:true}
    }

    @property({attribute: true, type:String, reflect:true})
    status = "off";

    @state()
    width = this.DEFAULT_STYLES.width;

    @state()
    height = this.DEFAULT_STYLES.height;

    constructor() {
        super();
    }

    private _parseCSS(k:string, v:string) {
        try {
            CSS.supports(k, v);
        } catch (err:any) {
            /*Some browsers doesnt support parse function*/
            return err['name'] != "TypeError";
        }
        return true;
    }
    private _parseCSSDimension(v:string) {
        return this._parseCSS('width', v);
    }
    private _resetStyles() {
        this.width = this.DEFAULT_STYLES.width;
        this.height = this.DEFAULT_STYLES.height;
    }
    override attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'style') {
            this._resetStyles();

            for (let literal of new_val.split(";")) {
                let [n, v] = literal.trim().split(":").map(x => x.trim());
                if (n == "width") {if (this._parseCSSDimension(v)) this.width = v;}
                else if (n == 'height') {if (this._parseCSSDimension(v)) this.height = v;}
            }
        }
    }
    override render() {
        return html`
        <style>
        :host {display:inline-block;vertical-align:middle;}
        .switch-dial {position:absolute;top:3px;bottom:3px;left:3px;right:calc(100% - ${this.height} - 3px);transition:all 0.1s ease;}
        :host([status='on']) .switch-dial {right:3px;left:calc(100% - ${this.height} + 3px);}
        .switch-container {height:${this.height};width:${this.width};
                           box-sizing:content-box;border-radius:${this.height};position:relative;cursor:pointer;}
        .switch-dial > svg {height:calc(${this.height} - 6px);width:calc(${this.height} - 6px);vertical-align:super;}
        </style>
        <div class="switch-container" part="switch-container"  @click=${this._onClick}>
                <span class="switch-dial">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle r="45" cx="50" cy="50" part="switch-dial-circle" />
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
