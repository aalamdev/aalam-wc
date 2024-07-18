import {LitElement, html} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {computePosition, flip, shift, offset, arrow} from '@floating-ui/dom';

@customElement('aalam-tooltip')
export class AalamTooltip extends LitElement {

    static disabledFeatures = ['shadow'];

    @property({type:String, attribute:true})
    msg = 'This is a Tooltip';

    @property({type:String, attribute:true})
    bodycls = 'tt-body';

    @property({type:String, attribute:true})
    arrowcls = 'tt-arrow';

    @property({type:String, attribute:true})
    position = 'top';

    constructor() {
        super();
    }
    override attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'position') {
            let validatePosition = (v:string) => {
                return (v=='top'||v=='bottom'||v == 'right'||v == 'left')
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
        let body_el = document.getElementsByClassName(this.bodycls);
        body_el.remove();
    }
    override createRenderRoot() {
        return this;
    }
    private _createTooltip() {
        //const el = this.children[0];
        const body_el = document.createElement("div");
        const arrow_el = document.createElement("div");
        this.setAttribute('aria-describedby', "tooltip");
        body_el.setAttribute('role', "tooltip");
        body_el.innerText = this.msg;
        body_el.classList.add(this.bodycls);
        arrow_el.classList.add(this.arrowcls);
        body_el.appendChild(arrow_el);
        this.appendChild(body_el);

        let update = () => {
            computePosition(this, body_el, {
                    placement: this.position,
                    middleware: [
                        offset(6),
                        flip(),
                        shift({padding: 5}),
                        arrow({element: arrow_el}),
                    ],
                }).then(({x, y, placement, middlewareData}) => {
                    Object.assign(body_el.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    });

                    const {x: arrowX, y: arrowY} = middlewareData.arrow;
                    const staticSide = {
                        top: 'bottom',
                        right: 'left',
                        bottom: 'top',
                        left: 'right',
                    }[placement.split('-')[0]];
                    Object.assign(arrow_el.style, {
                        left: arrowX != null ? `${arrowX}px`:'',
                        top: arrowY != null ? `${arrowY}px`:'',
                        right: '',
                        bottom: '',
                        [staticSide]: `-4px`,
                    });
            });
        }
        let showTooltip = () => {
            body_el.style.display = 'block';
            update();
        }
        let hideTooltip = () => {
            body_el.style.display = '';
        }
        [
            ['mouseenter', showTooltip],
            ['mouseleave', hideTooltip],
            ['focus', showTooltip],
            ['blur', hideTooltip],
        ].forEach(([event, listener]) => {
            this.addEventListener(event, listener);
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-tooltip":AalamTooltip;
    }
}
