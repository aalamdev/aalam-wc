
import {LitElement, html, css} from './index';
import {customElement, property} from './index';

@customElement('wc-switch')
export class SwitchComponent extends LitElement {
    @property()
    value = false;

    @property({attribute: true, type:Boolean, reflect:true})
    checked = false;

    @property({type: String})
    width = '60px';

    static override styles = css`
        :host {display:inline-block;}
        .switch-container {height:26px;width:60px;box-sizing:content-box;background-color:grey;border-radius:20px;position:relative;cursor:pointer;}
        .switch-dial > svg {height:20px;width:20px;}
        .switch-dial {position:absolute;top:3px;bottom:3px;left:3px;right:calc(100% - 23px);transition:all 0.1s ease;}
        :host([checked]) .switch-dial {right:3px;left:calc(100% - 23px);}
        :host([checked]) .switch-container {background-color:blue;}
    `;
    override connectedCallback() {
        super.connectedCallback();
    }

    /*override createRenderRoot() {
        return this;
    }*/

    override render() {
        return html`<div class="switch-container" style="width:${this.width}"  @click=${this._onClick}>
                <span class="switch-dial">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle r="45" cx="50" cy="50" fill="white" />
                    </svg>
                </span>
            </div>
            `;
    }
    private _onClick() {
        this.value = !this.value;
        this.checked = !this.checked;
    }
}
