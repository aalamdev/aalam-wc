import { LitElement, html, css } from "lit";
import { customElement, property, query, queryAssignedElements }
    from "lit/decorators.js";
import {computePosition, offset, flip, shift, autoUpdate}
    from "@floating-ui/dom";
import {parseAttrVal} from './utils';

@customElement('aalam-dropdown')
export class AalamDropdown extends LitElement {

    @property({type:String})
    animation = "";

    @property({type:Number})
    animationDur = 100;

    @property({type:String})
    closesel = "dd-close";

    @property({type:String})
    boundsel = "";

    @property({type:String})
    mode = "click";

    @property({type:String})
    position = "bottom-left";

    @property({type:Boolean})
    noflip = false;

    @property({type:Number})
    offset = 0;

    @queryAssignedElements({slot:'dd-body'})
    _dd_body_slot: HTMLSlotElement[] | null;

    @queryAssignedElements({slot:'dd-toggler'})
    _dd_toggler:HTMLSlotElement[]|null;

    @query(".dd-container")
    _dd_container:HTMLElement;

    private _isOpen = false;
    private _cleanup: (() => void) | null = null;
    private _animation_styles:{[key:string]:string} = {show:'', hide:''};
    private _parent_dd_element:HTMLElement|null;
    private _outside_click_event_listener = this._handleOutsideClick.bind(this);
    private _hide_event_listener = this.hide.bind(this);

    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'position') {
            let validate_position = (v:string) => {
                const pos_defs = [
                    'top', 'left', 'bottom', 'right',
                    'top-left', 'top-right',
                    'bottom-left', 'bottom-right',
                    'left-top', 'left-bottom',
                    'right-top', 'right-bottom'];
                return pos_defs.includes(v);
            }
            if(!validate_position(this.position))
                this.position = 'bottom-left';
        } else if(name == 'animation') {
            let open_as = ['reveal-x', 'reveal-y', 'fade-in'];
            let close_as = ['conceal-x', 'conceal-y', 'fade-out'];
            if (open_as.includes(this.animation) ||
                close_as.includes(this.animation)) {
                if(this.animation.startsWith('fade'))
                    this._animation_styles = {show:'fade-in', hide:'fade-out'};
                else if(this.animation.endsWith('x'))
                    this._animation_styles = {show:'reveal-x', hide:'conceal-x'};
                else
                    this._animation_styles = {show:'reveal-y', hide:'conceal-y'};
            } else {
                this._animation_styles = parseAttrVal(this.animation);
                if(!open_as.includes(this._animation_styles.show))
                    this._animation_styles.show = '';
                if(!close_as.includes(this._animation_styles.hide))
                    this._animation_styles.hide = '';
            }
            if(this._animation_styles.show)
                this.style.setProperty(
                    '--anim-open-name', this._animation_styles.show);
            if(this._animation_styles.hide)
                this.style.setProperty(
                    '--anim-close-name', this._animation_styles.hide);
        } else if(name == 'mode')
            if(this.mode != 'click' && this.mode != 'hover')
                this.mode = 'click';
    }
    override connectedCallback() {
        super.connectedCallback();
        document.addEventListener("click", this._outside_click_event_listener);
        this.renderRoot.addEventListener("slotchange", (e) => {
            this._slotChangedEvent(e)
        });
        let el = this.parentElement;
        let ix = 1;
        while(el) {
            if(el.tagName == 'AALAM-DROPDOWN') {
                if(this.mode == 'click') {
                    el.addEventListener('hide', this._hide_event_listener);
                    this._parent_dd_element = el;
                }
                ix = parseInt(el.style.getPropertyValue('--z-index')) + 1;
                break;
            }
            el = el.parentElement;
        }
        this.style.setProperty('--z-index', `${ix}`);
        this.style.setProperty('--anim-dur', `${this.animationDur}ms`);
        this.style.setProperty("--pseudo-display", "none");
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        if (this.mode === "hover") {
            this.removeEventListener("mouseenter", this._handleMouseEnter);
            this.removeEventListener("mouseleave", this._handleMouseLeave);
        } else {
            if(this._parent_dd_element)
                this._parent_dd_element.removeEventListener('hide', this._hide_event_listener);
        }
        document.removeEventListener(
            "click", this._outside_click_event_listener);
        if (this._cleanup) {
            this._cleanup();
            this._cleanup = null;
        }
    }
    override render() {
        return html`
<slot name="dd-toggler"
    @click=${this.mode === "click" ? this._toggleDropdown : null}>
</slot>
<div class="dd-container"
    @click="${this._bodyClickedEvent}"
    @animationend=${this._animationEnd}>
    <slot name="dd-body"></slot>
</div>`;
    }
    static override get styles() {
        return css`
:host {position: relative;display: inline-block;}
::slotted([slot="dd-toggler"]) {cursor: pointer;}
.dd-container {display:none;border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: absolute;z-index:var(--z-index);width: max-content;}
:host::before {
    content: " ";
    display: var(--pseudo-display, none);
    position:absolute;
    background: rgba(0, 0, 0, 0.01);
    top:calc(var(--pseudo-top) * 1px);
    height: calc(var(--pseudo-height) * 1px);
    left: calc(var(--pseudo-left) * 1px);
    width: calc(var(--pseudo-width) * 1px);
    clip-path: var(--pseudo-path);
}
.anim-open {animation:var(--anim-open-name) var(--anim-dur);
            display:block !important;transform-origin:var(--anim-open-side)}
.anim-close {animation:var(--anim-close-name) var(--anim-dur);
            display:block !important;transform-origin:var(--anim-close-side)}

    @keyframes fade-in {from {opacity:0} to {opacity:1}}
    @keyframes fade-out {from {opacity:1} to {opacity:0}}

    @keyframes reveal-x {from {transform:scaleX(0)} to {transform:scale(1)}}
    @keyframes conceal-x {from {transform:scaleX(1)} to {transform:scaleX(0)}}

    @keyframes reveal-y {from {transform:scaleY(0)} to {transform:scaleY(1)}}
    @keyframes conceal-y {from {transform:scaleY(1)} to {transform:scaleY(0)}}`
    }
    show() {
        if (this._isOpen) return;
        this._isOpen = true;

        if(this._dd_container) {
            if(this._animation_styles.show)
                this._dd_container.classList.add('anim-open');
            else
                this._dd_container.style.display = 'block';
        }
        this.positionDropdown();
        if(this.mode == 'hover')
            this.style.setProperty("--pseudo-display", "block");
        this.dispatchEvent(new Event("show"));
    }
    hide() {
        this.style.setProperty("--pseudo-display", "none");
        if (!this._isOpen) return;
        this._isOpen = false;
        if(this._dd_container) {
            if(this._animation_styles.hide)
                this._dd_container.classList.add('anim-close');
            if(!this._animation_styles.show)
                this._dd_container.style.display = 'none';
        }
        this._dd_container.classList.remove('anim-open');
        this.dispatchEvent(new Event("hide"));
    }
    private _slotChangedEvent(event:Event) {
        let target = event.target;
        if(!target)
            return;
        let name = (event.target as HTMLSlotElement)?.name;
        if(name == 'dd-toggler')
            if (this.mode === "hover") {
                target.addEventListener(
                    "mouseenter", this._handleMouseEnter.bind(this));
                this.addEventListener(
                    "mouseleave", this._handleMouseLeave.bind(this));
            }
    }
    private _animationEnd() {
        if(this._dd_container)
            this._dd_container.classList.remove('anim-close');
    }
    private _bodyClickedEvent(e:Event) {
        if(this.closesel && (e.target as HTMLElement).matches(this.closesel))
            this.hide();
        return;
    }
    private _handleMouseEnter() {
        this.show();
    };
    private _checkQuadrants(tgl:DOMRect, dpd:{[key:string]:number}) {
        /*
         * ----------
         *| q1 | q2 |
         *----tgl----
         *| q3 | q4 |
         *-----------
         */

        let connections = [];
        let getDPDQuad = (x:number, y:number) => {
            if (x < tgl.left) return (y < tgl.top)?'q1':'q3';
            else return (y < tgl.top)?'q2':'q4'
        }
        /*top left - visible if q2,q3 */
        if (['q3', 'q2'].indexOf(getDPDQuad(dpd.left, dpd.top)) >= 0) {
            connections.push('tl');
        }

        /*top right - visible if q1, q4*/
        if (['q1', 'q4'].indexOf(getDPDQuad(dpd.right, dpd.top)) >= 0) {
            connections.push('tr');
        }

        /*bottom left - visible if in q1, q4*/
        if (['q1', 'q4'].indexOf(getDPDQuad(dpd.left, dpd.bottom)) >= 0) {
            connections.push('bl')
        }

        /*bottom right - visible if in q2, q3*/
        if (['q2', 'q3'].indexOf(getDPDQuad(dpd.right, dpd.bottom)) >= 0) {
            connections.push('br')
        }
        return connections
    }
    private _handleMouseLeave() {
        this.hide();
    }
    private _handleOutsideClick(event: MouseEvent) {
        let target = event.target as HTMLElement|null;
        if (!this._isOpen) return;
        while (target) {
            if (target == this) {
                break;
            }
            let _target = target.assignedSlot?(
                target.assignedSlot.parentElement?
                    target.assignedSlot.parentElement:
                    target.parentElement):
                target.parentElement || (<ShadowRoot>target.getRootNode())?.host;
            target = _target as HTMLElement;
        }
        if(!target) {
            this.hide();
        }
    }
    private _toggleDropdown = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const isChildDropdown = target.closest("aalam-dropdown");
        if (!isChildDropdown || isChildDropdown === this) {
            this._isOpen ? this.hide() : this.show();
        }
    }
    private _safePolygonFunction(
        origin:{origin_x: string; origin_y: string}|undefined,
        x:number, y:number) {
        if(!this._dd_container || !this._dd_toggler)
            return;
        const tgl_rect = this._dd_toggler[0].getBoundingClientRect();
        const _dpd_rect = this._dd_container.getBoundingClientRect();
        const dpd_comp = getComputedStyle(this._dd_container);
        let dpd_width = parseInt(dpd_comp.width);
        let dpd_height = parseInt(dpd_comp.height);
        if(!origin) return;
        let dpd_rect = {
            top: (origin.origin_y == 'top')?_dpd_rect.top:(
                _dpd_rect.bottom - dpd_height),
            left: (origin.origin_x == 'left')?_dpd_rect.left:(
                _dpd_rect.right - dpd_width),
            right: (origin.origin_x == 'left')?(
                _dpd_rect.left + dpd_width):_dpd_rect.right,
            bottom: (origin.origin_y == 'top')?(
                _dpd_rect.top + dpd_height):_dpd_rect.bottom}
        let qp = this._checkQuadrants(tgl_rect, dpd_rect);
        if (qp.length == 0)
            return;
        let ps_w;
        let ps_h;
        let ps_t;
        let ps_l;
        let norm_x = dpd_rect.left - x
        let norm_y = dpd_rect.top - y;

        if (qp[0][1] == qp[1][1]) {
            ps_w = (qp[0][1] == 'l')?
                Math.abs(tgl_rect.left - dpd_rect.left):
                Math.abs(tgl_rect.right - dpd_rect.right);
            ps_l = (qp[0][1] == 'l')?
                tgl_rect.left - norm_x:(x + dpd_width);
        } else {
            ps_w = Math.max(tgl_rect.right, dpd_rect.right) - Math.min(
                tgl_rect.left, dpd_rect.left);
            ps_l = Math.min(tgl_rect.left - norm_x, dpd_rect.left - norm_x);
        }
        if (qp[0][0] == qp[1][0]) {
            ps_t = (qp[0][0] == 't')?
                tgl_rect.top - norm_y:dpd_rect.bottom - norm_y;
            ps_h = (qp[0][0] == 't')?
                Math.abs(tgl_rect.top - dpd_rect.top):
                Math.abs(tgl_rect.bottom - dpd_rect.bottom);
        } else {
            ps_h = Math.max(tgl_rect.bottom, dpd_rect.bottom) -
                Math.min(tgl_rect.top, dpd_rect.top);
            ps_t = Math.min(tgl_rect.top - norm_y, dpd_rect.top - norm_y);
        }
        this.style.setProperty('--pseudo-top', `${ps_t}`)
        this.style.setProperty('--pseudo-left', `${ps_l}`);
        this.style.setProperty('--pseudo-width', `${ps_w}`);
        this.style.setProperty('--pseudo-height', `${ps_h}`)

        const _getPolyCoord = () => {
            let c0 = qp[0];
            let c1 = qp[1]
            let r0:number[][] = [[], []];
            let r1:number[][] = [[], []];

            /* @ toggler */
            r0[0].push((c0[1] == 'l')?(ps_l * -1):(ps_l * -1 + tgl_rect.width));
            r0[0].push((c0[0] == 't')?(ps_t * -1):(ps_t * -1 + tgl_rect.height));
            /* @ Dropdown */
            r0[1].push((c0[1] == 'l')?
                (r0[0][0] + (dpd_rect.left - tgl_rect.left)):
                (r0[0][0] + (dpd_rect.right - tgl_rect.right)));
            r0[1].push((c0[0] == 't')?
                (r0[0][1] + (dpd_rect.top - tgl_rect.top)):
                (r0[0][1] + (dpd_rect.bottom - tgl_rect.bottom)));

            /* @ Dropdown*/
            if (c0[1] == c1[1])
                r1[0].push(r0[1][0])
            else
                r1[0].push((c1[1] == 'l')?
                    (r0[1][0] - dpd_width):(r0[1][0] + dpd_width));
            if (c0[0] == c1[0])
                r1[0].push(r0[1][1])
            else
                r1[0].push((c1[1] == 't')?
                    (r0[1][1] - dpd_height):(r0[1][1] + dpd_height));
            /* @ toggler */
            r1[1].push((c1[1] == 'l')?(ps_l * -1):(ps_l * -1 + tgl_rect.width));
            r1[1].push((c1[0] == 't')?(ps_t * -1):(ps_t * -1 + tgl_rect.height));

            let _conv = (v:number[][]) => v.map(x => `${x[0]}px ${x[1]}px`)
            return _conv(r0).concat(_conv(r1)).join(",");
        }
        const polygon = _getPolyCoord();
        this.style.setProperty('--pseudo-path', `polygon(${polygon})`);
    }

    async positionDropdown() {
        const positionMap: {[key: string]:any} = {
            "top-left": "top-start",
            "top-right": "top-end",
            "bottom-left": "bottom-start",
            "bottom-right": "bottom-end",
            "left-top": "left-start",
            "left-bottom": "left-end",
            "right-top": "right-start",
            "right-bottom": "right-end",
            'top': "top",
            'bottom': "bottom",
            'left': "left",
            'right': "right",
        };
        const ref_el = this.boundsel?
            (document.querySelector(`${this.boundsel}`) as HTMLElement) ||
                (this.querySelector('[slot="dd-toggler"]') as HTMLElement):
            (this.querySelector('[slot="dd-toggler"]') as HTMLElement);

        if (!ref_el) return;

        const middleware = [offset({mainAxis:this.offset,}), shift()];
        if (!this.noflip) {
            middleware.push(
                flip({ fallbackPlacements: ["top", "bottom", "left", "right"] })
            );
        }
        if(!this._dd_container) return;
        this._cleanup = autoUpdate(ref_el, this._dd_container, () => {
            computePosition(ref_el, this._dd_container, {
                placement: positionMap[this.position] || this.position,
                middleware: middleware,
            }).then((data) => {
                let origin = this._setTransOrigin(data.placement);
                let {x, y} = data;
                Object.assign(this._dd_container.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
                if(this.mode == 'hover')
                    this._safePolygonFunction(origin, x, y);
            });
        });
    }
    private _setTransOrigin(x:string) {
        const origin = {
            'top-start': {'origin_x': 'left', 'origin_y': 'bottom'},
            'top-end': {'origin_x': 'right', 'origin_y':'bottom'},
            'bottom-start': {'origin_x': 'left', 'origin_y': 'top'},
            'bottom-end': {'origin_x': 'right', 'origin_y': 'top'},
            'left-start': {'origin_x': 'right', 'origin_y':'top'},
            'left-end': {'origin_x': 'right', 'origin_y':'bottom'},
            'right-start': {'origin_x': 'left', 'origin_y': 'top'},
            'right-end': {'origin_x': 'left', 'origin_y': 'bottom'},
            'top' : {'origin_x':'left', 'origin_y': 'bottom'},
            'bottom' : {'origin_x':'left', 'origin_y': 'top'},
            'left' : {'origin_x': 'right', 'origin_y': 'top'},
            'right' : {'origin_x': 'left', 'origin_y': 'top'}
        }[x]
        let as = this._animation_styles;
        if(!origin) return;
        if(as.show) {
            if(as.show.endsWith('x'))
                this.style.setProperty('--anim-open-side', origin.origin_x);
            else if(as.show.endsWith('y'))
                this.style.setProperty('--anim-open-side', origin.origin_y);
        }
        if(as.hide) {
            if(as.hide.endsWith('x'))
                this.style.setProperty('--anim-close-side', origin.origin_x);
            else if(as.hide.endsWith('y'))
                this.style.setProperty('--anim-close-side', origin.origin_y);
        }
        return origin
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'aalam-dropdown':AalamDropdown;
    }
}
