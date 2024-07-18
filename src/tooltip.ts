import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import {computePosition, flip, shift, offset, arrow} from '@floating-ui/dom';

@customElement('aalam-tooltip')
export class AalamTooltip extends LitElement {

    @property({type:String, attribute:true})
    msg = 'This is a Tooltip';

    @property({type:String, attribute:true})
    position = 'top';

    @query('#body')
    body_el:HTMLElement;

    @query("#arrow")
    arrow_el:HTMLElement;

    constructor() {
        super();
    }
    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'position') {
            let validatePosition = (v:string) => {
                return (v == 'top' || v == 'bottom' ||
                        v == 'right' || v == 'left')
            }
            if(!validatePosition(this.position))
                this.position = 'top';
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this._createTooltip();
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
    }
    override render() {
        return html`
<slot></slot>
<div id="body" part="tt-body">${this.msg}<div id="arrow" part="tt-arrow"></div></div>`
    }
    static override get styles() {
        return css`
:host {position:relative}
#body {display:none;position:absolute}
#arrow {position:absolute}`
    }
    private _createTooltip() {
        let update = () => {
            computePosition(this, this.body_el, {
                    placement: this.position as any,
                    middleware: [
                        offset(6),
                        flip(),
                        shift({padding: 5}),
                        arrow({element: this.arrow_el}),
                    ],
                }).then(({x, y, placement, middlewareData}) => {
                    Object.assign(this.body_el.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });

                    const {x: arrowX, y: arrowY} = middlewareData.arrow as any;
                    const staticSide:string|undefined = {
                        top: 'bottom',
                        right: 'left',
                        bottom: 'top',
                        left: 'right',
                    }[placement.split('-')[0]];
                    let obj:{[key:string]: string} = {
                        left: arrowX != null ? `${arrowX}px`:'',
                        top: arrowY != null ? `${arrowY}px`:'',
                        right: '',
                        bottom: '',
                    }
                    if (staticSide)
                        obj[staticSide] = '-4px',
                    Object.assign(this.arrow_el.style, obj);
            });
        }
        let showTooltip = () => {
            this.body_el.style.display = 'block';
            update();
        }
        let hideTooltip = () => {
            this.body_el.style.display = '';
        }
        [
            ['mouseenter', showTooltip],
            ['mouseleave', hideTooltip],
            ['focus', showTooltip],
            ['blur', hideTooltip],
        ].forEach(([event_name, listener]) => {
            this.addEventListener(
                event_name as string,
                listener as EventListenerOrEventListenerObject);
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-tooltip":AalamTooltip;
    }
}
