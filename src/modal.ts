import {LitElement, html, css} from 'lit';
import {customElement, state,property} from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import {map} from 'lit/directives/map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {getResponsiveValues, parseAttrVal} from "./utils";

const active_modals:any = [];
const position_defs:{ [key:string]: any } = {
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
const animateTransform = (x:string, y:string) => {
    return {open: {from: `transform:translate(${x}, ${y});opacity:0`,
                   to: `opacity:1;transform:translate(0px, 0px)`},
            close: {from: `transform:translate(0px, 0px)`,
                    to: `transform:translate(${x},${y})`}}
}
const animate_defs:{ [key:string]:any} = {
    b2t: animateTransform("0px", "100%"),
    t2b: animateTransform('0px', "-100%"),
    r2l: animateTransform("100%", '0px'),
    l2r: animateTransform("-100%", '0px'),
    fade: {open: {from: "opacity:0", to: "opacity: 1"},
           close: {from: "opacity:1", to: "opacity:0"}}
}
const DEFAULT_MODAL_ZINDEX = '1';

@customElement('aalam-modal')
export class AalamModal extends LitElement {
    DEFAULT_VALUES:{ [key:string]: any } = {
        pos:     "xs:bottom;m:top-center",
        height:  "xs:50vh;m:auto",
        width:   "xs:100%;m:50vw",
        animation: "xs:b2t",
        position_breakpoints : [{cond:"(min-width:0px) and (max-width:992px)",
                                 val:"bottom"},
                                {cond: "(min-width:992px)", val: "top-center"}],
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
    closesel = null;

    @state()
    animationDur = .3;

    @state()
    _position_breakpoints = this.DEFAULT_VALUES.position_breakpoints;

    @state()
    _height_breakpoints = this.DEFAULT_VALUES.height_breakpoints;

    @state()
    _width_breakpoints = this.DEFAULT_VALUES.width_breakpoints;

    @state()
    _animate_breakpoints = this.DEFAULT_VALUES.animate_breakpoints;

    @state()
    _guide_value:{ [key:string]:any} = {};

    @state()
    _open = false;

    @state()
    _mouse_pos_mod = null;

    @state()
    _change_mc = false;

    @state()
    timer_obj:ReturnType<typeof setTimeout>|null = null;

    @query('#__wrapper')
    _wrapper_el:HTMLElement;

    actualParent:HTMLElement|null;

    private _mouse_up_listener:any;
    private _mouse_move_listener:any;
    private _mouse_prev_x:number;
    private _mouse_prev_y:number;
    private _wrp_init_bounds:any;

    override attributeChangedCallback(name:string, old_val:string,
                                      new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'open') {
            requestAnimationFrame(() => {
             this.open?this.show():this.hide()
            });
        }
        if (name == 'height'){
            this._height_breakpoints = getResponsiveValues(new_val,
                                       this.DEFAULT_VALUES.height);
        }
        if (name == 'width')
            this._width_breakpoints = getResponsiveValues(new_val,
                                      this.DEFAULT_VALUES.width);
        if(name == 'pos') {
            this._position_breakpoints = getResponsiveValues(new_val,
                                         this.DEFAULT_VALUES.pos,
                (v:string) => {
                    return position_defs[v] != null;
                });
        }
        if(name == 'animation') {
            this._animate_breakpoints = getResponsiveValues(new_val,
                                        this.DEFAULT_VALUES.animation,
                (v:string) => {
                    return animate_defs[v] != null;
            });
        }
        if(name == 'guidesel') {
            let tmp = parseAttrVal(new_val);
            this._guide_value = {}
            for (let k of Object.keys(tmp))
                this._guide_value[tmp[k]] = k;
        }
    }
    constructor() {
        super();
        document.addEventListener("keydown", this.handleKey.bind(this));
    }
    override connectedCallback() {
        super.connectedCallback();
    }
    override disconnectedCallback() {
        this.clearTimer();
    }
    handleKey(e: KeyboardEvent) {
        if(!this.noesc && this.open && e.key === 'Escape')
            if (!active_modals?.length ||
                active_modals[active_modals.length - 1] == this)
                this.hide();
    }
    clearTimer() {
        if (this.timer_obj)
            clearTimeout(this.timer_obj);
    }
    containerClicked() {
        if(this.open && !this.nobgclose)
            this.hide();
    }
    _wrapperClickedEvent(event:any) {
        event.stopPropagation();
        if (this.closesel && event.target.matches(this.closesel))
            this.hide();
    }
    show(delay?:number) {
        this.clearTimer();
        if (this._open)
            return;
        if(delay)
            this.timer_obj = setTimeout( () => {this.timer_obj=null;
                                        this.show()}, delay);
        else {
            if(this._wrp_init_bounds) {
               this._wrp_init_bounds = '';
               this._wrapper_el.style.right = '';
               this._wrapper_el.style.left = '';
               this._wrapper_el.style.width = '';
               this._wrapper_el.style.top = '';
               this._wrapper_el.style.bottom = '';
               this._wrapper_el.style.height = '';
            }
            this.style.zIndex = DEFAULT_MODAL_ZINDEX;
            if(this.stack)
                this.style.zIndex = DEFAULT_MODAL_ZINDEX + active_modals.length;
            else
                active_modals.forEach((m:any) => m.hide());
            if(!this.actualParent)
                this.actualParent = this.parentElement;
            this._open = this.open = true;
            active_modals.push(this);
            document.body.appendChild(this);
        }
    }
    hide(delay?:number) {
        this.clearTimer();
        if (!this._open)
            return;
        if (delay)
            this.timer_obj = setTimeout( () => {this.timer_obj=null;
                                        this.hide()}, delay);
        else
            this.open = false;
        if (this.animationDur == 0)
            this.closeEnd();

    }
    closeEnd() {
        this._open = this.open;
        if (!this._open) {
            this.actualParent?.appendChild(this);
            let ix = active_modals.indexOf(this);
            if (ix >= 0)
                active_modals.splice(ix, 1);
        }
    }
    private _dragStart(event:any) {
        if (event.target.matches(Object.keys(this._guide_value)))
            event.preventDefault();
    }
    private _touchStart(event:any) {
        let css_pos = window.getComputedStyle(this._wrapper_el)
                                 .getPropertyValue("position");
        if(css_pos == "relative")
            return;
        if (!this._wrp_init_bounds)
            this._wrp_init_bounds = this._wrapper_el.getBoundingClientRect();
        for (let guide_sel of Object.keys(this._guide_value)) {
            let el = event.target;
            while (el) {
                if (el.matches(guide_sel)) {
                    this._mouse_prev_y = event.clientY;
                    this._mouse_prev_x = event.clientX;
                    this._mouse_move_listener = this._mouseMoveEvent.bind(this);
                    this._mouse_up_listener = this._mouseUpEvent.bind(this);
                    this._mouse_pos_mod = this._guide_value[guide_sel];
                    document.addEventListener("mouseup", 
                                             this._mouse_up_listener);
                    document.addEventListener("touchend", 
                                             this._mouse_up_listener);
                    document.addEventListener("mousemove", 
                                             this._mouse_move_listener);
                    document.addEventListener("touchmove", 
                                             this._mouse_move_listener);
                    break;
                }
                el = el.parentElement;
            }
            if (this._mouse_move_listener)
                break;
        }
    }
    private _mouseMoveEvent(event:any) {
        let xdiff = event.clientX - this._mouse_prev_x;
        let ydiff = event.clientY - this._mouse_prev_y;
        let rect = this._wrapper_el.getBoundingClientRect();
        let vw = Math.max(document.documentElement.clientWidth || 0,
                          window.innerWidth || 0)
        let vh = Math.max(document.documentElement.clientHeight || 0,
                          window.innerHeight || 0)
        let lim = 70/100;

        this._mouse_prev_y = event.clientY;
        this._mouse_prev_x = event.clientX;
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
                    this._wrapper_el.style.right = vw -
                        (this._wrp_init_bounds.x + this._wrp_init_bounds.width)
                        + 'px';
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
                    this._wrapper_el.style.bottom = vh - 
                        (this._wrp_init_bounds.y + this._wrp_init_bounds.height)
                        + 'px';
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
    private _mouseUpEvent() {
        document.removeEventListener("mouseup", this._mouse_up_listener);
        document.removeEventListener("touchend", this._mouse_up_listener);
        document.removeEventListener("mousemove", this._mouse_move_listener);
        document.removeEventListener("touchmove", this._mouse_move_listener);
        this._mouse_move_listener = this._mouse_up_listener = null;
    }
    private _posStyles() {
        let ret = []
        let mc =[]
        let dir = (s:any) => {
            return `${Object.keys(s).map(k => `${k}:${s[k]}`).join(";")}`
        }
        for (let bp of this._position_breakpoints) {
            this._change_mc = true;
            if(bp.val.endsWith("center")) {
                if(bp.val == 'center')
                    mc.push(`@media screen and ${bp.cond} {.__modal-container 
                           {align-items:flex-start;justify-content:center} 
                           .__modal-wrapper {margin:auto;position:relative}}
                    `);
                else
                    mc.push(`@media screen and ${bp.cond} 
                           {.__modal-container {justify-content:center}}
                    `);
            }
            ret.push(`@media screen and ${bp.cond} 
                    {.__resp_pos {${dir(position_defs[bp.val])}}
                     .__modal-container {overflow:auto}}
            `)
        }
        ret.push(mc);
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
    private _hwStyles(cls:any, bps:any) {
        let ret = []
        for (let bp of bps) {
            if (bp.val != 'auto')
                ret.push(`@media screen and ${bp.cond} {.__resp_${cls}
                        {${cls}:${bp.val};
                        ${cls == "width"?'overflow-x:auto':'overflow-y:auto'}}}
                `);
            else
                ret.push(`@media screen and ${bp.cond}
                        {#__wrapper {justify-content:center}}
                `);
        }
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
    private _animateStyles() {
        let ret = [];
        for (let bp of this._animate_breakpoints) {
            ret.push(`@media screen and ${bp.cond} {
            .animate-open {animation:${bp.val}-open ${this.animationDur}s}
            @keyframes ${bp.val}-open {from {${animate_defs[bp.val].open.from}}
                                       to {${animate_defs[bp.val].open.to}}}
            .animate-close {animation:${bp.val}-close ${this.animationDur}s}
            @keyframes ${bp.val}-close {from {${animate_defs[bp.val].close.from}}
                                        to {${animate_defs[bp.val].close.to}}}}
            `)
        }
        return html`<style>${map(ret, (r) => html`${r}`)}</style>`
    }
    override render() {
        let cont_styles:any = {
            opacity: this.open?1:0,
            display: this._open?this._change_mc?'flex':'block':'none',
            transition: css`opacity ${this.animationDur/2}s linear`
        }
        return html `
        ${this._posStyles()}
        ${this._hwStyles('height', this._height_breakpoints)}
        ${this._hwStyles('width', this._width_breakpoints)}
        ${this._animateStyles()}
        <div @click=${this.containerClicked} class="__modal-container"
             style="${styleMap(cont_styles)}">
            <div id="__wrapper" class="__modal-wrapper __resp_pos __resp_height
                     __resp_width ${(this._mouse_up_listener != null)?
                     "mousedown":""} ${this.open?'animate-open':'animate-close'}"
                @animationend=${this.closeEnd}
                @dragstart=${this.guidesel?this._dragStart:null}
                @touchstart=${this.guidesel?this._touchStart:null}
                @mousedown=${this.guidesel?this._touchStart:null}
                @click=${(event:any) => this._wrapperClickedEvent(event)}>
                <slot name="modal-body" id="slot-body" class="modal-body">
                </slot>
            </div>
        </div>
        `;
    }

    static override get styles() {
        return css`
    :host {position:relative}
    .__modal-wrapper {z-index:1}
    .__modal-container {position:fixed;top:0;bottom:0;right:0;left:0;
                        background-color:rgba(0,0,0,0.5);}
    .mousedown {user-select: none;}
    `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-modal":AalamModal;
    }
}
