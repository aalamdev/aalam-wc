import {LitElement, html, css} from 'lit';
import {customElement, state,property} from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import {map} from 'lit/directives/map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {animationCSS, animate_defs, getResponsiveValues, parseAttrVal}
    from "./utils";

const active_modals:Array<object|null> = [];
const DEFAULT_MODAL_ZINDEX = '1';
const position_defs:{[key:string]:{[key:string]:string|number}} = {
    bottom: {bottom:0, right:0, left:0, position:"absolute",
             "max-height":"100vh"},
    top: {top:0, right:0, left:0,position:"absolute",
          "max-height":"100vh"}, 
    right: {top:0, bottom:0, right:0,position:"absolute"},
    left: {top:0, bottom:0, left:0,position:"absolute"}, 
    center: {position:"relative"},
    "top-center": {top:0,position:"absolute", "max-height":"100vh"},
    "bottom-center": {bottom:0,position:"absolute", "max-height":"100vh"},
    "top-left": {top:0, left:0, position:"absolute", "max-height":"100vh"},
    "top-right": {top:0, right:0, position:"absolute", "max-height":"100vh"},
    "bottom-left": {bottom:0, left:0, position:"absolute",
                    "max-height":"100vh"},
    "bottom-right": {bottom:0, right:0, position:"absolute",
                     "max-height":"100vh"},
    full: {top:0, bottom:0, right:0, left:0,position:"absolute"}
}

@customElement('aalam-modal')
export class AalamModal extends LitElement {
    DEFAULT_VALUES:{ [key:string]: any } = {
        bgcolor: "rgba(0,0,0,0.6)",
        pos:     "xs:bottom;m:top-center",
        height:  "xs:50vh;m:auto",
        width:   "xs:100%;m:50vw",
        animation: "xs:b2t",
        position_breakpoints : [{cond:"(min-width:0px) and (max-width:992px)",
                                 val:"bottom", ll:0, ul:992},
                                {cond: "(min-width:992px)", val: "top-center",
                                 ll:993}],
        height_breakpoints : [{cond: "(min-width:0px) and (max-width:992px)",
                               val: "50vh"},
                             {cond: "(min-width:992px)", val: "auto"}],
        width_breakpoints : [{cond: "(min-width:0px) and (max-width:992px)",
                              val: "100%"},
                             {cond: "(min-width:992px)", val: "50vw"}],
        animate_breakpoints : [{cond: "(min-width:0px)", val: "b2t",
                                ul:null, ll:0}]
    }
    @property({type:Boolean, reflect:true, attribute:true})
    open = false;

    @property({type:String, attribute:true})
    bgcolor = this.DEFAULT_VALUES.bgcolor;

    @property({type:Boolean, attribute:true})
    noesc = false;

    @property({type:Boolean, attribute:true})
    nobgclose = false;

    @property({type:Boolean, attribute:true})
    stack = false;

    @property({type:String, attribute:true})
    guidesel = null;

    @property({type:String, attribute:true})
    pos = this.DEFAULT_VALUES.pos;

    @property({type:String, attribute:true})
    height = this.DEFAULT_VALUES.height;

    @property({type:String, attribute:true})
    width = this.DEFAULT_VALUES.width;

    @property({type:String, attribute:true})
    animation = this.DEFAULT_VALUES.animation;

    @property({type:String, attribute:true})
    closesel = '';

    @state()
    animationDur = 300;

    @state()
    _open = false;

    @query('#__wrapper')
    _wrapper_el:HTMLElement;

    private _position_breakpoints = this.DEFAULT_VALUES.position_breakpoints;
    private _height_breakpoints = this.DEFAULT_VALUES.height_breakpoints;
    private _width_breakpoints = this.DEFAULT_VALUES.width_breakpoints;
    private _animate_breakpoints = this.DEFAULT_VALUES.animate_breakpoints;
    private _guide_value:{[key:string]:string} = {};
    private _mouse_pos_mod:string|null;
    private _timer_obj:ReturnType<typeof setTimeout>|null = null;
    private _actualparent:HTMLElement|null;
    private _key_listener = this._handleKey.bind(this);
    private _resize_listener = this._resizeEvent.bind(this);
    private _mouse_up_listener:any;
    private _mouse_move_listener:any;
    private _mouse_prev_x:number;
    private _mouse_prev_y:number;
    private _mouse_direction:{x: number|null, y:number|null};
    private _wrp_init_bounds:DOMRect|null;
    private _cur_pos:string|null;
    private _clamp_values:{[key:string]:number|null} = {};

    constructor() {
        super();
    }
    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'open')
            requestAnimationFrame(() => {
                this.open?this.show():this.hide()});
        else if (name == 'height') {
            this._height_breakpoints = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.height, (v:string) => {
                    try {
                        CSSStyleValue.parse("height", v);
                        return true;
                    } catch (err:any) {}
                        return false;
                });
        } else if (name == 'width') {
            this._width_breakpoints = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.width, (v:string) => {
                    try {
                        CSSStyleValue.parse("width", v);
                        return true;
                    } catch (err:any) {}
                        return false;
                });
        } else if(name == 'pos') {
            this._position_breakpoints = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.pos, (v:string) => {
                    return position_defs[v];
                });
        } else if(name == 'animation') {
            this._animate_breakpoints = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.animation, (v:string) => {
                    return animate_defs[v];
                });
        } else if(name == 'guidesel') {
            let tmp = parseAttrVal(new_val);
            for(let i in tmp) {
                if(tmp[i].includes(',')) {
                    let x = tmp[i].split(',');
                    tmp[i] = x[0];
                    if(x[1] == 'edge')
                        this._clamp_values[i] = 0;
                    else {
                        let num = +x[1];
                        if (!isNaN(num) && num <= 20 && num >= 0)
                            this._clamp_values[i] = num;
                    }
                }
                this._guide_value[tmp[i]] = i;
            }
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        window.addEventListener("resize", this._resize_listener);
        document.addEventListener("keydown", this._key_listener);
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        this._clearTimer();
        window.removeEventListener("resize", this._resize_listener);
        document.removeEventListener("keydown", this._key_listener);
    }
    override render() {
        let cont_styles:{[key:string]:string} = {
            opacity: this.open?"1":"0",
            display: this._open?'block':'none',
            transition: `opacity ${this.animationDur/2}s linear`,
            "background-color":`${this.bgcolor}`
        }
        return html `
${this._posStyles()}
${this._hwStyles('height', this._height_breakpoints)}
${this._hwStyles('width', this._width_breakpoints)}
${this._animateStyles()}
<div @click=${!this.nobgclose?this._containerClicked:null}
     class="__modal-container" style="${styleMap(cont_styles)}">
    <div id="__wrapper" class="__modal-wrapper __resp_pos __resp_height
             __resp_width ${(this._mouse_up_listener != null)?
             "mousedown":""} ${this.open?'animate-open':'animate-close'}"
        @animationend=${this._animationEndEvent}
        @touchstart=${this.guidesel?this._touchStart:null}
        @dragstart=${this.guidesel?this._dragStart:null}
        @mousedown=${this.guidesel?this._touchStart:null}
        @click=${this._wrapperClickedEvent}>
        <slot name="modal-body" id="slot-body" class="modal-body">
        </slot>
    </div>
</div>`
    }
    static override get styles() {
        return css`
:host {position:relative}
.__modal-wrapper {z-index:1}
.__modal-container {position:fixed;top:0;bottom:0;right:0;left:0;}
.mousedown {user-select: none;}`
    }
    override firstUpdated() {
        this._cur_pos = this._checkPos();
    }
    show(delay?:number) {
        this._clearTimer();
        if (this._open)
            return;
        if(delay) {
            this._timer_obj = setTimeout( () => {
                this._timer_obj=null;
                this.show()}, delay);
            return;
        }
        else
            this._setWrapperBoundsNull();
        this.style.zIndex = DEFAULT_MODAL_ZINDEX;
        if(this.stack)
            this.style.zIndex = DEFAULT_MODAL_ZINDEX + active_modals.length;
        else
            active_modals.forEach((m:any) => m.hide());
        if(!this._actualparent)
            this._actualparent = this.parentElement;
        this._open = this.open = true;
        active_modals.push(this);
        document.body.appendChild(this);
    }
    hide(delay?:number) {
        this._clearTimer();
        if (!this._open)
            return;
        if (delay) {
            this._timer_obj = setTimeout( () => {
                this._timer_obj=null;
                this.hide()}, delay);
            return;
        }
        else
            this.open = false;
        if (this.animationDur == 0)
            this._animationEndEvent();
    }
    private _handleKey(e: KeyboardEvent) {
        if(!this.noesc && this.open && e.key === 'Escape')
            if (!active_modals?.length ||
                active_modals[active_modals.length - 1] == this)
                this.hide();
    }
    private _resizeEvent() {
        let val = this._checkPos();
        if(this._cur_pos != val) {
            this._setWrapperBoundsNull();
            this._cur_pos = val;
        }
    }
    private _checkPos() {
        let vw = window.innerWidth;
        for(let style of this._position_breakpoints)
            if((style.ll || 0) <= vw && (!style.ul || style.ul >= vw)) {
                return style.val;
            }
    }
    private _setWrapperBoundsNull() {
        if(this._wrp_init_bounds) {
            this._wrp_init_bounds = null;
            this._wrapper_el.style.right = '';
            this._wrapper_el.style.left = '';
            this._wrapper_el.style.width = '';
            this._wrapper_el.style.top = '';
            this._wrapper_el.style.bottom = '';
            this._wrapper_el.style.height = '';
        }
    }
    private _clearTimer() {
        if (this._timer_obj) {
            clearTimeout(this._timer_obj);
            this._timer_obj = null;
        }
    }
    private _containerClicked() {
        if(this.open)
            this.hide();
    }
    private _wrapperClickedEvent(event:Event) {
        event.stopPropagation();
        if(this.closesel && (
            event.target as HTMLElement).matches(this.closesel))
            this.hide();
        return;
    }
    private _animationEndEvent() {
        this._open = this.open;
        if (!this._open) {
            this._actualparent?.appendChild(this);
            let ix = active_modals.indexOf(this);
            if (ix >= 0)
                active_modals.splice(ix, 1);
        }
    }
    private _dragStart(event:Event) {
        event.preventDefault();
    }
    private _touchStart(event:Event) {
        let css_pos = window.getComputedStyle(
            this._wrapper_el).getPropertyValue("position");
        let clientX = ((event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientX:(
                event as MouseEvent).clientX);
        let clientY = ((event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientY:(
                event as MouseEvent).clientY);
        if(css_pos == "relative")
            return;
        if (!this._wrp_init_bounds)
            this._wrp_init_bounds = this._wrapper_el.getBoundingClientRect();
        let el = event.target as HTMLElement | null;
        this._mouse_direction = {x: null, y: null};
        while (el) {
            if(el.matches(Object.keys(this._guide_value).join(","))) {
                this._mouse_prev_y = clientY;
                this._mouse_prev_x = clientX;
                this._mouse_move_listener = this._mouseMoveEvent.bind(this);
                this._mouse_up_listener = this._mouseUpEvent.bind(this);
                for (let guide_sel of Object.keys(this._guide_value))
                    if(el.matches(guide_sel)) {
                        this._mouse_pos_mod = this._guide_value[guide_sel];
                    }
                document.addEventListener("mouseup", this._mouse_up_listener);
                document.addEventListener("touchend", this._mouse_up_listener);
                document.addEventListener(
                    "mousemove", this._mouse_move_listener);
                document.addEventListener(
                    "touchmove", this._mouse_move_listener);
                /*to avoid the touch action it initiate scrolling*/
                event.stopPropagation();
                event.preventDefault();
                break;
            } else
                el = el.parentElement;
        }
    }
    private _mouseMoveEvent(event:MouseEvent|TouchEvent) {
        if(!this._wrp_init_bounds)
            return;
        let clientX = ((event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientX:(
                event as MouseEvent).clientX);
        let clientY = ((event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientY:(
                event as MouseEvent).clientY);
        let xdiff = clientX - this._mouse_prev_x;
        let ydiff = clientY - this._mouse_prev_y;
        let rect = this._wrapper_el.getBoundingClientRect();
        let vw = Math.max(document.documentElement.clientWidth || 0,
                      window.innerWidth || 0)
        let vh = Math.max(document.documentElement.clientHeight || 0,
                      window.innerHeight || 0)
        let lim = 70/100;

        this._mouse_prev_y = clientY;
        this._mouse_prev_x = clientX;
        this._mouse_direction.x = xdiff;
        this._mouse_direction.y = ydiff;
        if (xdiff) {
            let calc;
            if (this._mouse_pos_mod == 'left') {
                calc = rect.left + xdiff;
                if ((rect.width - xdiff) < this._wrp_init_bounds.width * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.left = calc + 'px';
                if (!this._wrapper_el.style.right) {
                    this._wrapper_el.style.right =
                        vw - (this._wrp_init_bounds?.x +
                        this._wrp_init_bounds?.width) + 'px';
                }
                this._wrapper_el.style.width = "auto";
            } else if (this._mouse_pos_mod == 'right') {
                calc =  vw - rect.x - rect.width - xdiff;
                if ((rect.width + xdiff) < this._wrp_init_bounds.width * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.right = calc + 'px';
                if (!this._wrapper_el.style.left)
                    this._wrapper_el.style.left = this._wrp_init_bounds.x + 'px';
                this._wrapper_el.style.width = "auto";
            }
        }
        if (ydiff) {
            let calc;
            if (this._mouse_pos_mod == "top") {
                calc = rect.top + ydiff;
                if ((rect.height - ydiff) < this._wrp_init_bounds.height * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.top = calc + 'px';
                if (!this._wrapper_el.style.bottom) {
                    this._wrapper_el.style.bottom =
                        vh - (this._wrp_init_bounds.y +
                        this._wrp_init_bounds.height) + 'px';
                }
                this._wrapper_el.style.height =  "auto";
            } else if (this._mouse_pos_mod == 'bottom') {
                calc = vh - rect.y - rect.height - ydiff;
                if ((rect.height + ydiff) < this._wrp_init_bounds.height * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.bottom = calc + 'px';
                if (!this._wrapper_el.style.top)
                    this._wrapper_el.style.top = this._wrp_init_bounds.y + 'px';
                this._wrapper_el.style.height =  "auto";
            }
        }
    }
    private _clampPoint() {
        let vw = window.innerWidth;
        let vh = window.innerHeight;
        if (this._mouse_pos_mod == 'left') {
            if (this._mouse_direction.x && this._mouse_direction.x < 0 &&
                    this._clamp_values.left != null)
                this._wrapper_el.style.left =
                    (vw / 100) * this._clamp_values.left + 'px';
        } else if (this._mouse_pos_mod == 'right') {
            if (this._mouse_direction.x && this._mouse_direction.x > 0 &&
                    this._clamp_values.right != null)
                this._wrapper_el.style.right =
                    (vw / 100) * this._clamp_values.right + "px";
        } else if (this._mouse_pos_mod == 'top') {
            if (this._mouse_direction.y && this._mouse_direction.y < 0 &&
                    this._clamp_values.top != null)
                this._wrapper_el.style.top =
                    (vh / 100) * this._clamp_values.top + 'px';
        } else if (this._mouse_pos_mod == 'bottom') {
            if (this._mouse_direction.y && this._mouse_direction.y > 0 &&
                    this._clamp_values.bottom != null)
                this._wrapper_el.style.bottom =
                    (vh / 100) * this._clamp_values.bottom + "px";
        }
    }
    private _mouseUpEvent() {
        document.removeEventListener("mouseup", this._mouse_up_listener);
        document.removeEventListener("touchend", this._mouse_up_listener);
        document.removeEventListener("mousemove", this._mouse_move_listener);
        document.removeEventListener("touchmove", this._mouse_move_listener);
        this._clampPoint();
        this._mouse_move_listener = this._mouse_up_listener = null;
    }
    private _posStyles() {
        if(!this._open)
            return;
        let ret = []
        let dir = (s:{[key:string]:string|number}) => {
            return `${Object.keys(s).map(k => `${k}:${s[k]}`).join(";")}`
        }
        let ix= 0 ;
        for (let bp of this._position_breakpoints) {
            let addn_cont_def = null;
            let wrapper_def = null;
            let mc_style = null;
            ix = ix+1;
            if(bp.val.endsWith("center")) {
                mc_style = "display:flex !important;justify-content:center";
                if(bp.val == 'center') {
                    wrapper_def = "margin:auto;position:relative";
                    addn_cont_def = "align-items:flex-start";
                }
            }
            ret.push(`
@media screen and ${bp.cond} {.__resp_pos {${dir(position_defs[bp.val])}}
${wrapper_def?`.__modal-wrapper {${wrapper_def}}`:''}
.__modal-container {overflow:auto;${addn_cont_def};${mc_style}}}`);
        }
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
    private _hwStyles(cls:string, bps:Array<{[key:string]:string}>) {
        let ret = []
        for (let bp of bps) {
            if (bp.val != 'auto')
                ret.push(`
@media screen and ${bp.cond} {.__resp_${cls} {${cls}:${bp.val};
${cls == "width"?'overflow-x:auto':'overflow-y:auto'}}}`);
            else
                ret.push(`
@media screen and ${bp.cond} {#__wrapper {justify-content:center}}`);
        }
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
    private _animateStyles() {
        let ret = [];
        for (let bp of this._animate_breakpoints) {
            let as = {open: bp.val, close: bp.val}
            ret.push(`
@media screen and ${bp.cond} {${animationCSS(
    '.animate-open', '.animate-close', as, this.animationDur)}}`)
        }
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-modal":AalamModal;
    }
}
