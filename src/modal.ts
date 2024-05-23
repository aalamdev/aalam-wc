import {LitElement, html,css} from 'lit';
import {customElement, state,property} from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import {map} from 'lit/directives/map.js';
import {getResponsiveValues, parseAttrValue} from "./utils";

const active_modals = [];
const limit_map = {xs:[0,640], s:[640,960], m:[960,1200], l:[1200,1600], xl:[1600,null]};
const sizes = ['xs','s','m','l','xl'];
const position_defs = {
    bottom: {top:"50%", bottom:0, right:0, left:0},
    top: {top:0, bottom:"50%", right:0, left:0}, 
    right: {top:0, bottom:0, right:0, left:"50%"}, 
    left: {top:0, bottom:0, right:"50%", left:0}, 
    center: {top:"30%", bottom:"30%", right:"30%", left:"30%"},
    "top-center": {top:0, bottom:"50%", right:"30%", left:"30%"},
    "bottom-center": {top:"50%", bottom:0, right:"30%", left:"30%"},
    "top-left": {top:0, bottom:"50%", right:"50%", left:0},
    "top-right": {top:0, bottom:"50%", right:0, left:"50%"},
    "bottom-left": {top:"50%", bottom:0, right:"50%", left:0},
    "bottom-right": {top:"50%", bottom:0, right:0, left:"50%"},
    full: {top:0, bottom:0, right:0, left:0}
}
const animate_screen = {
    b2t: {x:'0px', y:"100%"},
    t2b: {x:'0px', y:"-100%"},
    r2l: {x:"100%", y:'0px'},
    l2r: {x:"-100%", y:'0px'},
    fade: {x:'0px', y:'0px'}
}
const guide_visibility = {
    top: true,
    bottom: true,
    left: true,
    right: true
}
const DEFAULT_MODAL_ZINDEX = 999;

@customElement('aalam-modal')
export class AalamModal extends LitElement {
    DEFAULT_VALUES:{ [key:string]:string } = {
        pos : "xs:bottom;m:top-center",
        height :  "xs:50vh;m:auto",
        width : "xs:100%;m:50vw",
        animate : "xs:b2t",
        position_breakpoints : [{cond: "width <= 960px", val: "bottom"},
                                {cond: "width > 960px", val: "top-center"}],
        height_breakpoints : [{cond: "width <= 960px", val: "50vh"},
                             {cond: "width > 960px", val: "auto"}],
        width_breakpoints : [{cond: "width <= 960px", val: "100%"},
                             {cond: "width > 960px", val: "50vw"}],
        animate_breakpoints : [{cond: "width >= 0px", val: "b2t"}]
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
    pos:string = this.DEFAULT_VALUES.pos;

    @property({type:String, attribute:true})
    height:string = this.DEFAULT_VALUES.height;

    @property({type:String, attribute:true})
    width:string = this.DEFAULT_VALUES.width;

    @property({type:String, attribute:true})
    animate:string = this.DEFAULT_VALUES.animate;

    @property({type:String, attribute:true})
    closesel:string = null;

    @state()
    _position_breakpoints = this.DEFAULT_VALUES.position_breakpoints;

    @state()
    _height_breakpoints = this.DEFAULT_VALUES.height_breakpoints;

    @state()
    _width_breakpoints = this.DEFAULT_VALUES.width_breakpoints;

    @state()
    _animate_breakpoints = this.DEFAULT_VALUES.animate_breakpoints;

    @state()
    _guide_value = null;

    @state()
    _open = false;

    @query('#__wrapper')
    _wrapper_el:HTMLElement;

    actualParent: HTMLElement=null;
    private _mouse_up_listener:Function;
    private _mouse_move_listener:Function;
    private _mouse_start_x:number;
    private _mouse_start_y:number;
    private _mouse_prev_x:number;
    private _mouse_prev_y:number;
    private _wrp_init_bounds;

    _mapping_default(default_val:string, new_val:string) {
        let inp_map_new = parseAttrValue(new_val);
        let inp_map_default = parseAttrValue(default_val);
        let size;
        for(size of sizes) {
            if(inp_map_new[size] == null){
                if(inp_map_default[size] != null)
                    inp_map_new[size] = inp_map_default[size];
                }
                else
                    break;
        }
        return inp_map_new;
    }
    attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'open') {
            requestAnimationFrame(() => {
             this.open?this.show():this.hide()
            });
        }
        if (name == 'height')
            this._height_breakpoints = getResponsiveValues(new_val, this.DEFAULT_VALUES.height);
        if (name == 'width')
            this._width_breakpoints = getResponsiveValues(new_val, this.DEFAULT_VALUES.width);
        if(name == 'pos')
            this._position_breakpoints = getResponsiveValues(new_val, this.DEFAULT_VALUES.pos);
        if(name == 'animate')
            this._animate_breakpoints = getResponsiveValues(new_val, this.DEFAULT_VALUES.animate);
        if(name == 'guidesel') {
            let tmp = parseAttrValue(new_val);
            this._guide_value = {}
            console.log("tmp = ", tmp);
            console.log("guide value : ",this.guide_value);
            for (let k of Object.keys(tmp))
                this._guide_value[tmp[k]] = k;
            console.log("guidesel : ", this._guide_value);
        }
    }
    constructor() {
        super();
        document.addEventListener("keydown", this.handleKey.bind(this));
    }
    connectedCallback() {
        super.connectedCallback();
    }
    disconnectedCallback() {
        if (this.timer_obj)
        clearTimeout(this.timer_obj);
    }

    _get_condition(ul:Number, ll:Number) {
        if(ul == null || ll == 0)
            return (ul == null)?`width >= ${ll}px` : `width <= ${ul}px`;
        else
            return `${ll}px <= width <= ${ul}px`;
    }

    handleKey(e: KeyboardEvent) {
        if(!this.noesc && this.open && e.key === 'Escape')
            if (!active_modals?.length || active_modals[active_modals.length - 1] == this)
                this.hide();
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
        if (this._open)
            return;
        if(delay > 0)
            this.timer_obj = setTimeout( () => {this.timer_obj = null;this.show();}, delay);
        else {
            if(this._wrp_init_bounds) {
               this._wrapper_el.style.right = null;
               this._wrapper_el.style.left = null;
               this._wrapper_el.style.right = null;
               this._wrapper_el.style.top = null;
               this._wrapper_el.style.bottom = null;
               this._wrapper_el.style.height = null;
            }
            this.style.zIndex = DEFAULT_MODAL_ZINDEX;
            if(this.stack)
                this.style.zIndex = DEFAULT_MODAL_ZINDEX +  active_modals.length;
            else
                active_modals.forEach(m => m.hide());
            if(!this.actualParent)
                this.actualParent = this.parentElement;
            this._open = this.open = true;
            active_modals.push(this);
            document.body.appendChild(this);
        }
    }
    hide(delay?:number) {
        if (!this._open)
            return;
        if (delay > 0)
            setTimeout( () => {this.hide()}, delay);
        else
            this.open = false;

    }
    closeEnd() {
        this._open = this.open;
        if (!this._open) {
            this.actualParent.appendChild(this);
            let ix = active_modals.indexOf(this);
            if (ix >= 0)
                active_modals.splice(ix, 1);
        }
    }

    private _dragStart(event) {
        if (event.target.matches(Object.keys(this._guide_value)))
            event.preventDefault();
    }
    private _touchStart(event) {
        if (!this._wrp_init_bounds)
            this._wrp_init_bounds = this._wrapper_el.getBoundingClientRect();
        for (let guide_sel of Object.keys(this._guide_value)) {
            let el = event.target;
            while (el) {
                if (el.matches(guide_sel)) {
                    this._mouse_prev_y = this._mouse_start_y = event.clientY;
                    this._mouse_prev_x = this._mouse_start_x = event.clientX;
                    this._mouse_move_listener = this._mouseMoveEvent.bind(this);
                    this._mouse_up_listener = this._mouseUpEvent.bind(this);
                    this._mouse_pos_mod = this._guide_value[guide_sel];
                    document.addEventListener("mouseup", this._mouse_up_listener);
                    document.addEventListener("touchend", this._mouse_up_listener);
                    document.addEventListener("mousemove", this._mouse_move_listener);
                    document.addEventListener("touchmove", this._mouse_move_listener);
                    break;
                }
                el = el.parentElement;
            }
            if (this._mouse_move_listener)
                break;
        }
    }
    private _mouseMoveEvent(event) {
        let xdiff = event.clientX - this._mouse_prev_x;
        let ydiff = event.clientY - this._mouse_prev_y;
        let rect = this._wrapper_el.getBoundingClientRect();
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        let lim = 70/100;

        this._mouse_prev_y = event.clientY;
        this._mouse_prev_x = event.clientX;
        if (xdiff) {
            let calc;
            if (this._mouse_pos_mod == 'left') {
                calc = rect.left + xdiff;
                if (rect.width < this._wrp_init_bounds.width * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.left = calc + 'px';
                if (!this._wrapper_el.style.right)
                    this._wrapper_el.style.right = vw - (this._wrp_init_bounds.x + this._wrp_init_bounds.width) + 'px';
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
            }
            if (calc)
                this._wrapper_el.style.width = "auto";
        }
        if (ydiff) {
            let calc;
            if (this._mouse_pos_mod == "top") {
                calc = rect.top + ydiff;
                if (rect.height < this._wrp_init_bounds.height * lim) {
                    this.hide();
                    return;
                } else if (calc < 0)
                    return;
                this._wrapper_el.style.top = calc + 'px';
                if (!this._wrapper_el.style.bottom)
                    this._wrapper_el.style.bottom = vh - (this._wrp_init_bounds.y + this._wrp_init_bounds.height) + 'px';
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
            }
            if (calc)
                this._wrapper_el.style.height =  "auto";
        }
    }
   private _mouseUpEvent(event) {
        document.removeEventListener("mouseup", this._mouse_up_listener);
        document.removeEventListener("touchend", this._mouse_up_listener);
        document.removeEventListener("mousemove", this._mouse_move_listener);
        document.removeEventListener("touchmove", this._mouse_move_listener);
        this._mouse_move_listener = this._mouse_up_listener = null;
    }
    render() {
        return html `
        ${map(this._position_breakpoints, bp => html`<style>@media screen and (${bp.cond}) { .pos{
            top: ${bp.full_height?0:position_defs[bp.val].top};
            bottom:${bp.full_height?0:position_defs[bp.val].bottom};
            left:${bp.full_width?0:position_defs[bp.val].left};
            right:${bp.full_width?0:position_defs[bp.val].right};
            position:absolute;
            ${bp.full_height?"height:100vh !important;":""}
            ${bp.full_width?"width?100vw !important;":""}
            }}</style>`)}
        ${map(this._height_breakpoints, bp => html`<style>@media screen and (${bp.cond}) { .high{ height:${bp.val};overflow:scroll;}}</style>`)}
        ${map(this._width_breakpoints, bp => html`<style>@media screen and (${bp.cond}) { .wid{ width:${bp.val};overflow:scroll;}}</style>`)}
        ${map(this._animate_breakpoints, bp => html`<style>@media screen and (${bp.cond}) { 
             .animate-open {animation:${bp.val}-open  .3s}
             @keyframes ${bp.val}-open {from{transform:translate(${animate_screen[bp.val].x}, ${animate_screen[bp.val].y});opacity:0} to{opacity:1;transform:translate(0px, 0px)}}

            .animate-close {animation:${bp.val}-close .3s}
             @keyframes ${bp.val}-close {from{transform:translate(0px, 0px)} to{transform:translate(${animate_screen[bp.val].x},${animate_screen[bp.val].y})}}
           }</style>`)}
        <div @click=${this.containerClicked} class="__modal-container" style="opacity:${this.open?1:0};display:${this._open?'block':'none'}">
            <div id="__wrapper" class="__modal-wrapper pos high wid ${(this._mouse_up_listener != null)?"mousedown":""} ${this.open?'animate-open':'animate-close'}"
                @animationend=${this.closeEnd}
                @dragstart=${this.guidesel?this._dragStart:null}
                @touchstart=${this.guidesel?this._touchStart:null}
                @mousedown=${this.guidesel?this._touchStart:null}
                @click=${(event) => this._wrapperClickedEvent(event)}>
                <slot name="modal-body">
                </slot>
            </div>
        </div>
        `;
    }

    static styles = css`
    :host {position:relative;}
    .__modal-wrapper {position:absolute;z-index:1;}
    .__modal-container {position:fixed;top:0;bottom:0;right:0;left:0;background-color:rgba(0,0,0,0.5);transition:opacity .15s linear}
    .mousedown {user-select: none;}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-modal":AalamModal;
    }
}
