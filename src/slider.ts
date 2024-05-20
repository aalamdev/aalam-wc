import {LitElement, css, html} from 'lit';
import {styleMap} from 'lit-html/directives/style-map.js';
import {customElement, property, state, queryAssignedElements, query, eventOptions} from 'lit/decorators.js';

import {getResponsiveValues, ResponsiveVal} from "./utils";

class MouseEventData {
    prev_x:number;
    start_x:number;
    move_handler:EventListenerOrEventListenerObject;
    end_handler:EventListenerOrEventListenerObject;
    moved_x:number;
    direction:string; /*L -> swipe towards left, R - swipe towards right*/

    constructor(x:number, el:HTMLElement, move_handler:Function, end_handler:Function) {
        this.start_x = x;
        this.prev_x = x;
        this.move_handler = move_handler.bind(el);
        this.end_handler = end_handler.bind(el);
        this.moved_x = 0;
        this.direction = "";
        document.addEventListener("mouseup", this.end_handler);
        document.addEventListener("touchend", this.end_handler);
        document.addEventListener("mousemove", this.move_handler);
        document.addEventListener("touchmove", this.move_handler);
    }
    destroy() {
        document.removeEventListener("mouseup", this.end_handler);
        document.removeEventListener("touchend", this.end_handler);
        document.removeEventListener("mousemove", this.move_handler);
        document.removeEventListener("touchmove", this.move_handler);
    }
};

interface ItemLimit {
    right:number;
    left:number;
    /*coords with translated x*/
    tright:number;
    tleft:number;
}

interface ItemsCoords {
    rt_ix:number;
    lt_ix:number;
    c_ix:number;
    rt_limit:ItemLimit;
    lt_limit:ItemLimit;
    c_limit:ItemLimit;
    no_next:boolean;
    no_prev:boolean;
};
const log = (..._args:any[]) => {}; //console.log

@customElement('aalam-slider')
export class AalamSliderElement extends LitElement {
    @property({type: Boolean, attribute:true, reflect: true})
    loop:Boolean = false;

    @property({type: String, reflect:true})
    autoslide:String|null = null;

    @property({type: Boolean, reflect: true})
    center:Boolean = false;

    @property({type: Boolean, reflect: true})
    sets: Boolean = false;

    @property({type: Number})
    anchorindex:number = 0;

    @property({type: Boolean, reflect: true})
    noguide:Boolean = false;

    @property({type: String, attribute:true, reflect: true})
    gap:String = "xs:0px";

    @property({type:Number, reflect: false, attribute:false})
    transition_dur:number = 0.3;

    @queryAssignedElements({ slot: 'slide-item' })
    slide_items:Array<HTMLElement>;

    @queryAssignedElements({ slot: 'nav-guide-item' })
    guide_items!:Array<HTMLElement>;

    @query('.__container')
    container_el:HTMLElement;

    @query(".__guide")
    guide_blk_el:HTMLElement;

    @query(".__def_guide")
    def_guide_el:HTMLElement;

    @state()
    private _itemgap:Array<ResponsiveVal> = [];

    @state()
    private translatex:number = 0;

    @state()
    private showing:boolean = false;

    @state()
    no_prev:boolean = false;

    @state()
    no_next:boolean = false;

    private _mouse_event_data:MouseEventData|null = null;
    private _coords:ItemsCoords;
    private _animated_queue:Array<{direction:string}> = [];
    private _direction:string = "";
    private _set_items:number[]|null = null;
    private _autoslide:{dur:number, onhover:string, timer:ReturnType<typeof setTimeout>|null} = {dur:0, onhover:'pause', timer:null};
    private _active_attr = "data-active-ix";

    /* When nav-guide-item slot is not filled up by the application,
     * we use the default guide elements store in this*/
    private _guide_els:Array<HTMLElement> = [];

    constructor() {
        super();
        this._coords = <ItemsCoords>{};
        this._coords.rt_ix = this._coords.lt_ix = 0;
    }
    override attributeChangedCallback(attr:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(attr, old_val, new_val);
        if (attr == "gap") {
            this._itemgap = getResponsiveValues(new_val || "",
                                                {xs:"0px"},
                                                (v:string) => {
                try {
                    CSSStyleValue.parse("padding-left", v);
                    return true;
                } catch (err:any) {}
                return false;
            })
        } else if (attr == 'autoslide') {
            this._setupAutoSlide(new_val);
        } else if (attr == "center" || attr == "sets" || attr == "loop") {
            if (this.slide_items?.length) {
                if (this.sets && !this.center)
                    this._set_items = this._setupSets();
                else
                    this._set_items = null;
                if (attr == 'loop' && !this.loop) {
                    let initial_rect = this.slide_items[this.anchorindex].getBoundingClientRect();
                    for (let el of this.slide_items)
                        el.style.order = "";
                    let r = this.slide_items[this.anchorindex].getBoundingClientRect();
                    this.translatex += initial_rect.left - r.left;
                }
                let ix = this.anchorindex;
                this.anchorindex = -1;
                this.show(ix);
                this._setupGuides(true);
            }
        }
    }
    slotChangedEvent(event:Event) {
        let name = (event.target as HTMLSlotElement)?.name
        if (name == 'slide-item') {
            if (this.sets && !this.center)
                this._set_items = this._setupSets();
            this._setupGuides();
            this._show(0, 'L');
        } else if (name == "nav-guide-item") {
            if (this.slide_items)
                this._setupGuides();
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", (e) => {this.slotChangedEvent(e)});
    }
    static override get styles() {
        return css`
:host {position:relative;overflow:hidden;overflow:clip;display:block;}
.__container {display:flex;flex-wrap:nowrap;will-change:transform;position:relative;touch-action:pan-y;}
.__container.__trans {trasition-timing-function: ease;}
.__container > ::slotted(*) {flex:none;box-sizing:border-box;}
.__nav {position:absolute;font-weight:700;font-size:40px;color:rgba(0,0,0,0.5);top:50%;transform:translateY(-50%);cursor:pointer;user-select:none}
.__nav.__prev {left: 0;margin-left:20px;}
.__nav.__next {right: 0;margin-right:20px;}
.__def_guide {margin-right:12px;cursor:pointer}
.__def_guide:last-child {margin-right:0px;}
.__def_guide[data-active-ix="0"] > circle {fill:grey;}
.__guide {position:absolute;bottom:0;margin-bottom:20px;left:0;right:0;text-align:center}`
    }

    override render() {
        let cont_style:{[key: string]: string} = { }
        if (this.translatex != null)
            cont_style['transform'] = `translateX(${this.translatex}px)`;
        if (this.showing && this.transition_dur) {
            cont_style['transition-duration'] = `${this.transition_dur}s`;
            cont_style['transition-property'] = 'transform';
        }
        if (this._mouse_event_data)
            cont_style['user-select'] = 'none';
        let gap_styles = html`${this._itemgap.map(bp =>
html`@media ${bp.ll != null?`(min-width:${bp.ll}px)`:''} ${bp.ll != null && bp.ul != null?' and ':''} ${bp.ul != null?`(max-width:${bp.ul}px)`:''} {
.__container > ::slotted(*) {padding-left: ${bp.val};}
.__container {margin-left: -${bp.val};}
        }`)}`;

        return html`
<style>
    ${gap_styles}
</style>
<div class="__container ${this._mouse_event_data?'':'__trans'}" style="${styleMap(cont_style)}"
    @dragstart=${this._dragStartEvent}
    @mouseover=${(this._autoslide['dur'] && this._autoslide['onhover'] == 'pause')?this._stopTimer:null}
    @mouseout=${(this._autoslide['dur'] && this._autoslide['onhover'] == 'pause' && !this._mouse_event_data)?this._startTimer:null}
    @touchstart=${this._touchStartEvent}
    @mousedown=${this._touchStartEvent}
    @transitionend=${this._animationEndEvent}
    tabindex="-1">
    <slot name="slide-item"></slot>
</div>
<span @click=${this.next} style="display:${this.no_next?"none":"inline-block"}"><slot name="nav-next"><span class="__nav __next">&gt;</span></slot></span>
<span @click=${this.prev} style="display:${this.no_prev?"none":"inline-block"}"><slot name="nav-prev"><span class="__nav __prev">&lt;</span></slot></span>
<div part="nav-guide" style="display:${this.noguide?'none':'block'}" class="__guide" @click=${this._navGuideClickEvent}>
<div style="display:none">
<svg class="__def_guide" height="10px" width="10px" xmlns="http://www.w3.org/2000/svg"><circle r="4.5" cx="5" cy="5" fill="none" stroke="currentColor" /></svg>
</div>
<slot name="nav-guide-item"></slot>
</div>
</div>
`
    }
    private _setupAutoSlide(val:string) {
        if (val) {
            let spl = val.split(";")
            for (let s of spl) {
                let [k, v] = s.trim().split(":")
                k = k.trim();
                v = v.trim();
                if (k == 'dur') {
                    let iv = parseInt(v, 10);
                    if (!Number.isNaN(iv))
                        this._autoslide['dur'] = iv;
                } else if (k != 'onhover') {
                    if (v == 'play' || v == 'pause')
                        this._autoslide['onhover'] = v;
                }
            }
        } else {
            this._autoslide['dur'] = 0;
            this._autoslide['onhover'] = 'pause';
        }

        if (this._autoslide['dur'])
            this._startTimer();
        else if (this._autoslide['timer']) {
            this._stopTimer();
        }
    }
    private _stopTimer() {
        if (!this._autoslide['timer'])
            return;
        clearTimeout(this._autoslide['timer']);
        this._autoslide['timer'] = null;
    }
    private _startTimer() {
        if (this._autoslide['timer']) {
            this._stopTimer();
        }
        if (!this._autoslide['dur'])
            return;
        this._autoslide['timer'] = setTimeout(() => {
            this._autoslide['timer'] = null;
            return this.next();
        }, this._autoslide['dur'])
    }
    private _getGap() {
        let ml = window.getComputedStyle(this.container_el).marginLeft;
        return parseInt(ml || '0px', 10) * -1;
    }
    private _setupSets() {
        let p_el = this.clientWidth;
        let ret = [0];
        let wd = 0;
        let gap = this._getGap();
        for (let ix = 0;ix < this.slide_items.length; ix++) {
            wd += this.slide_items[ix].offsetWidth;
            if (wd > (p_el + gap)) {  /*Include the negative margin for gap*/
                ret.push(ix);
                wd = this.slide_items[ix].offsetWidth;
            }
        }
        return ret;
    }
    private _setupGuides(force?:boolean) {
        let num_guides = (this._set_items || this.slide_items).length;
        if (this.guide_items?.length > 1) {
            if (!force)
                return;
            let rem_els = this.guide_items.slice(1);
            for (let el of rem_els) {
                el.remove();
            }
            this.guide_items[0].removeAttribute(this._active_attr);
        }

        if (this._guide_els?.length) {
            for (let el of (this._guide_els || []))
                el.remove();
            this._guide_els = []
        }
        for (let i = (this.guide_items?.length?1:0); i < num_guides; i++) {
            if (this.guide_items?.[0]) {
                let el = this.guide_items[0].cloneNode(true);
                this.appendChild(el);
            } else {
                let el = <HTMLElement>this.def_guide_el.cloneNode(true);
                this.guide_blk_el.appendChild(el);
                this._guide_els.push(el);
            }
        }
    }
    private _fireEvent(ixs:number[], ename:string) {
        for (let ix of ixs) {
            let event = new CustomEvent(ename, {
                bubbles: true,
                cancelable: true,
                detail: this.slide_items[ix],
            })
            this.dispatchEvent(event);
        }
    }
    private _updateActive() {
        let gels = this.guide_items?.length?this.guide_items:this._guide_els;
        let shown_ix:number[] = [];
        let hidden_ix:number[] = [];

        let classify = (i:number, a:number) => {
            let old_attr = this.slide_items[i].getAttribute(this._active_attr)
            if (old_attr == "0" && a != 0)
                hidden_ix.push(i)
            else if (old_attr != "0" && a == 0)
                shown_ix.push(i)
            this.slide_items[i].setAttribute(this._active_attr, `${a}`);
        }
        if (!this.sets || this.center) {
            for (let i = 0; i < this.slide_items.length; i++) {
                gels[i].setAttribute(this._active_attr, `${i - this.anchorindex}`);
                classify(i, i - this.anchorindex);
            }
        } else {
            let last_i = (this._set_items?.length || 0) - 1;
            for (let i = 0; i < (this._set_items?.length || 0); i++) {
                gels[i].setAttribute(this._active_attr, `${i - this.anchorindex}`);
                for (let j = this._set_items?.[i] || 0;
                     j < (i == last_i?this.slide_items.length:(this._set_items?.[i + 1] || this.slide_items.length));
                     j++) {
                    classify(j, i - this.anchorindex);
                }
            }
        }
        this._fireEvent(shown_ix, "itemshown");
        this._fireEvent(hidden_ix, "itemhidden");
    }
    private _setupOrder(direction:string, new_ix:number):number {
        if (!this.loop)
            return 0;

        let tx = 0;
        let prev_lt_ix = (this._coords.lt_ix == 0?
            this.slide_items.length:this._coords.lt_ix) - 1;
        let initial_rect = this.slide_items[new_ix].getBoundingClientRect();
        for (let ix = 0; ix < this.slide_items.length; ix++) {
            let el = this.slide_items[ix];
            if ((direction == 'R' && (ix >= this._coords.lt_ix))){
                el.style.order = "-1";
            } else if (direction == 'L' && (ix < prev_lt_ix)) {
                el.style.order = "1";
            } else {
                if (direction == 'L' && ix == prev_lt_ix &&
                    ix == 0 && el.style.order == "1") {
                    /* When the first element is at the left after a loop,
                     * the last element would be before it. If the first
                     * element is moving out to further left, then entire list
                     * of items will get their order removed, hence this is
                     * needed so that next() animation works smoothly.
                     */
                    tx += (el.offsetWidth);
                }
                el.style.order = "";
            }
        }

        let r = this.slide_items[new_ix].getBoundingClientRect();
        log("new ix:", new_ix, ", initial rect:", initial_rect.left,
            ", cur left:", r.left);
        return initial_rect.left - r.left;
    }
    private _getContainerHalfWidth() {
        return this.clientWidth/2
    }
    private _getCenterX() {
        return this._getContainerHalfWidth() +
               this.getBoundingClientRect().left;
    }
    private _fetchItemsToShow(show_ix:number, pr:DOMRect, offset:number|undefined) {
        let _ix = show_ix;
        let last_ix = this.slide_items.length - 1;
        let ir = this.slide_items[show_ix].getBoundingClientRect();
        let total_wd = (ir.left - pr.left) - (offset || 0)
        let center_x = this._getCenterX();
        let c_ix = show_ix;
        if (this.center && !this._mouse_event_data) {
            /*We dont want this to happen when the items are swiped*/
            let center_w = this._getContainerHalfWidth();
            let gap = this._getGap(); //parseInt(this._itemgap || '0px', 10);
            let half_ix = (ir.right - ir.left - gap)/2;
            center_w -= (half_ix);
            while (center_w >= 0) {
                if (show_ix == 0) {
                    if (!this.loop)
                       break
                    show_ix = this.slide_items.length;
                }
                show_ix -= 1;
                ir = this.slide_items[show_ix].getBoundingClientRect();
                center_w -= (ir.right - ir.left)
            }
            total_wd = center_w;
            _ix = show_ix;
        }

        let iterate_dir = 'R'
        while (true) {
            let el = this.slide_items[iterate_dir == 'R'?_ix:show_ix];
            let r = el.getBoundingClientRect();
            let el_w = r.right - r.left;
            if (this.center && r.left <= center_x && center_x < r.right)
                c_ix = (iterate_dir == 'R'?_ix:show_ix);
            log("  calc: d:", iterate_dir, ", rt_ix ", _ix, ", lt_ix ",show_ix,
                ", el width ", el_w, ", total wd ", el_w,
                "+", total_wd, "=", (total_wd + el_w), ", parent width ",
                this.clientWidth, " (", r.left, ":", r.right, ")");
            total_wd += (r.right - r.left);
            if (total_wd >= this.clientWidth)
                break
            if (_ix == last_ix) {
                if (!this.loop) {
                    if (iterate_dir == 'L' && show_ix == 0)
                        break;

                    iterate_dir = 'L'
                } else
                    _ix = -1;
            }
            if (iterate_dir == 'R')
                _ix += 1;
            else if (iterate_dir == 'L')
                show_ix -= 1
        }
        return {lt_ix: show_ix, rt_ix: _ix, c_ix: c_ix}
    }
    private _getLimit(x:DOMRect, pr:{left:number,right:number,center:number}, edge:string) {
        let e = pr[edge as keyof typeof pr];
        return <ItemLimit>{right: x.right - e,
                           left: x.left - e,
                           tleft: x.left - e - this.translatex,
                           tright: x.right - e - this.translatex}

    }
    private _calcRightLeftIndices(new_ix:number, direction:string, offset?:number):number {
        log("_calcIndices: dir ", direction, ", lt_ix ", (new_ix),
            ", rt ix ", this._coords.rt_ix, ", transx ", this.translatex,
            ", offset ", offset, ", showing ", this.anchorindex);
        let prev_lt_ix = this._coords.lt_ix;
        let pr = this.getBoundingClientRect();

        let {lt_ix, rt_ix, c_ix} = this._fetchItemsToShow(new_ix, pr, offset);
        this._coords.lt_ix = lt_ix;
        this._coords.rt_ix = rt_ix;
        this._coords.c_ix = c_ix;

        let tx:number = (this.loop &&
                  prev_lt_ix != this._coords.lt_ix)?this._setupOrder(
            direction, (!this.center || this._mouse_event_data)?
                        (direction == 'L'?
                         this._coords.lt_ix:this._coords.rt_ix):new_ix):0;
        if (tx)  {
            if (this._mouse_event_data) {
                this._mouse_event_data.start_x -= tx;
            }
        }

        let lr = this.slide_items[this._coords.lt_ix].getBoundingClientRect();
        let rr = this.slide_items[this._coords.rt_ix].getBoundingClientRect();
        let cr = this.slide_items[this._coords.c_ix].getBoundingClientRect();
        let plimit = {left: pr.left, right: pr.right, center: this._getCenterX()};
        let limit = (x:DOMRect, edge:string) => this._getLimit(x, plimit, edge)
        this._coords.rt_limit = limit(rr, 'right');
        this._coords.lt_limit = limit(lr, 'left');
        this._coords.c_limit = limit(cr, 'center');
        this._direction = direction;

        log("Calc: ",
            this._coords.lt_limit.left, "(", this._coords.lt_ix, ")",
            this._coords.lt_limit.right,
            " ----- ",
            this._coords.rt_limit.left, "(", this._coords.rt_ix, ")",
            this._coords.rt_limit.right,
            ", tx:", tx, ", off:", offset);
        log("Calc: ",
            this._coords.lt_limit.tleft, "(", this._coords.lt_ix, ")",
            this._coords.lt_limit.tright,
            " ----- ",
            this._coords.rt_limit.tleft, "(", this._coords.rt_ix, ")",
            this._coords.rt_limit.tright,
            ", tx:", tx, ", translatex:", this.translatex);
        return tx
    }
    private _dragStartEvent(event:Event) {
        event.preventDefault();
    }
    private _navGuideClickEvent(event:PointerEvent) {
        let el:HTMLElement|null = event.target as HTMLElement;
        while (el) {
            if (el.slot == 'nav-guide-item' || el.classList.contains("__def_guide"))
                break
            el = el.parentElement;
        }
        if (!el)
            return;
        let ix = (el.slot == 'nav-guide-item'?this.guide_items:this._guide_els)
            .indexOf(el);
        if (ix >= 0)
            this.show(ix);
    }
    private _touchMoveEvent(event:MouseEvent|TouchEvent) {
        if (!this._mouse_event_data) return

        let last_ix = this.slide_items.length - 1;
        let revamp_ix = null;
        let clientX = ((event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientX:(event as MouseEvent).clientX);
        let direction = this._mouse_event_data.prev_x > clientX?
            'L':((this._mouse_event_data.prev_x < clientX)?
                 'R':this._mouse_event_data.direction);

        this.translatex = clientX - this._mouse_event_data.start_x;
        this._mouse_event_data.prev_x = clientX;

        log("Move: ",
            this._coords.lt_limit.tleft, "(", this._coords.lt_ix, ")",
            this._coords.lt_limit.tright,
            " ----- ", 
            this._coords.rt_limit.tleft, "(", this._coords.rt_ix, ")",
            this._coords.rt_limit.tright, ", tx:", this.translatex,
            ", moved x ", this._mouse_event_data.moved_x);

        if (direction == 'L') { /* moving towards left */
            this._mouse_event_data.direction = 'L'
            if ((this._coords.lt_limit.tright + this.translatex) < 0) {
                if (this.loop)
                    revamp_ix = (this._coords.lt_ix == last_ix)?
                        0:(this._coords.lt_ix + 1);
                else if (this._coords.lt_ix < last_ix)
                    revamp_ix = this._coords.lt_ix + 1;
            } else if ((this._coords.rt_limit.tright + this.translatex) < 0) {
                /*The left index is not changed*/
                if (this.loop || this._coords.rt_ix < last_ix)
                    revamp_ix = this._coords.lt_ix;
            }
        } else if (direction == 'R') { /* moving towards right */
            this._mouse_event_data.direction = 'R'
            if ((this._coords.lt_limit.tleft + this.translatex) > 0 || 
                (this._coords.rt_limit.tleft + this.translatex) > 0) {
                if (this.loop)
                    revamp_ix = (this._coords.lt_ix == 0)?
                        last_ix:(this._coords.lt_ix - 1);
                else if (this._coords.lt_ix > 0)
                    revamp_ix = this._coords.lt_ix - 1;
            }
        }
        if (revamp_ix != null) {
            let off = 0;
            if (!this._mouse_event_data)
                return;

            if (this._mouse_event_data.direction == 'R') {
                let ir = this.slide_items[revamp_ix].getBoundingClientRect();
                let pr = this.getBoundingClientRect();
                off = ir.left - pr.left;
            }
            this.translatex += this._calcRightLeftIndices(
                revamp_ix, this._mouse_event_data.direction, off);
            this.anchorindex = this.center?this._coords.c_ix:this._coords.lt_ix;
            if (this.sets)
                this.anchorindex = this._getSetIndex(this.anchorindex);
            this._updateActive();
        } else if (this.center) {
            let changed = false;
            if (direction == 'L' &&
                (this._coords.c_limit.tright + this.translatex) < 0) {
                this._coords.c_ix = (this._coords.c_ix < last_ix)?
                    this._coords.c_ix + 1:(this.loop?0:this._coords.c_ix)
                changed = true;
            } else if (direction == 'R' &&
                       (this._coords.c_limit.tleft + this.translatex) > 0) {
                this._coords.c_ix = (this._coords.c_ix > 0)?
                    this._coords.c_ix - 1:(this.loop?last_ix:this._coords.c_ix)
                changed = true;
            }
            if (changed) {
                let ir = this.slide_items[this._coords.c_ix]
                    .getBoundingClientRect();
                let cx = this._getCenterX();
                this._coords.c_limit = this._getLimit(ir, {center: cx, left: 0, right: 0}, 'center');
                this.anchorindex = this._coords.c_ix;
                this._updateActive();
            }
        }
    }
    @eventOptions({passive: true})
    private _touchStartEvent(event:MouseEvent|TouchEvent) {
        let clientX = (event as TouchEvent).touches?
            (event as TouchEvent).touches[0].clientX:(event as MouseEvent).clientX;
        this._mouse_event_data = new MouseEventData(
            clientX - (this.translatex || 0), this,
            this._touchMoveEvent, this._touchEndEvent);
        this._mouse_event_data.moved_x = 0;
        this.showing = false;
        this.translatex += this._calcRightLeftIndices(
            this._coords.lt_ix, this._direction);
    }
    private _getCenterItem(dir:string) {
        let center_x = this._getCenterX();
        let ix = this._coords.lt_ix;
        while ((this._coords.lt_ix <= ix) &&
               (ix <= (this._coords.rt_ix + (
                (this._coords.lt_ix > this._coords.rt_ix)?
                    this.slide_items.length:0)))) {
            let _ix = ix % this.slide_items.length;
            let el = this.slide_items[_ix];
            let r = el.getBoundingClientRect();
            let el_cntr = el.offsetWidth/2 + r.left;
            if (r.left <= center_x  && center_x <= r.right) {
                if (dir == 'L' && el_cntr < center_x)
                    ix += 1;
                else if (dir == 'R' && el_cntr > center_x)
                    ix = ix == 0?(!this.loop?
                        ix:this.slide_items.length - 1):(ix - 1);
                break
            }
            if (!this.loop && ((dir == 'L' && ix == this.slide_items.length - 1) ||
                               (dir == 'R' && ix == 0)))
                return ix;
            ix += 1
        }
        let ret = ix % this.slide_items.length;
        if (dir == 'L') {
            /*For loop, and direction left, the show() will add an index automatically*/
            ret = (ret == 0?this.slide_items.length:ret) - 1;
        }
        return ret;
    }
    private _getSetIndex(ix:number) {
        let ret = 0;
        if (!this._set_items) return ix;
        for (let i = this._set_items.length - 1; i >= 0; i--) {
            if (this._set_items[i] <= ix) {
                ret = i;
                break
            }
        }
        return ret
    }
    private _recalibrateCoords(tx:number) {
        if (this.loop)
            return;

        let pr = this.getBoundingClientRect();
        let center_x = this._getCenterX();

        let lt_ix:number|undefined, rt_ix:number|undefined, c_ix:number|undefined;
        let lt_r:DOMRect|undefined, rt_r:DOMRect|undefined, c_r:DOMRect|undefined;
        let _tr = (r:DOMRect) => r.right - tx;
        let _tl = (r:DOMRect) => r.left - tx;
        for (let i = 0; i < this.slide_items.length; i++) {
            let r = this.slide_items[i].getBoundingClientRect();
            if (_tr(r) > pr.left && _tl(r) <= pr.right) {
                if (lt_ix == null) {
                    lt_r = r;
                    lt_ix = i;
                }
                rt_ix = i
                rt_r = r;
            }
            if (_tl(r) <= center_x && center_x < _tr(r)) {
                c_ix = i;
                c_r = r;
            }
        }
        let parent_limit = {left: pr.left, right: pr.right, center: center_x}
        this._coords.lt_ix = lt_ix as number;
        this._coords.lt_limit = this._getLimit(
            <DOMRect>{right: _tr(lt_r as DOMRect), left: _tl(lt_r as DOMRect)},
            parent_limit, 'left');

        this._coords.rt_ix = rt_ix as number;
        this._coords.rt_limit = this._getLimit(
            <DOMRect>{right: _tr(rt_r as DOMRect), left: _tl(rt_r as DOMRect)},
            parent_limit, 'left');

        this._coords.c_ix = c_ix as number;
        this._coords.c_limit = this._getLimit(
            <DOMRect>{right: _tr(c_r as DOMRect), left: _tl(c_r as DOMRect)},
            parent_limit, 'center');
    }
    private _touchEndEvent() {
        if (!this._mouse_event_data) return
        let last_ix = this.slide_items.length - 1;
        let tx = this.translatex;
        let dir = this._mouse_event_data.direction;
        let gap = this._getGap();
        this._mouse_event_data.destroy();
        this._mouse_event_data = null;
        log("touch end");
        if (!dir)
            return;
        if (!this.loop) {
            log(`dir:${dir}, anchr ${this.anchorindex}, rt ix ${this._coords.rt_ix}, tx:${tx}`);
            if ((this.center?this.anchorindex:this._coords.rt_ix) == last_ix
                && tx < 0) {
                this.showing = true;
                requestAnimationFrame(() => {
                    let ir = this.slide_items[last_ix].
                        getBoundingClientRect();
                    let pr = this.getBoundingClientRect();
                    if (!this.center) {
                        this.translatex += (pr.right - ir.right);
                    } else {
                        let r = pr.left + this.clientWidth/2;
                        this.translatex += (r - ir.right + (
                            this.slide_items[last_ix].clientWidth - gap)/2);
                    }
                    this._recalibrateCoords(tx - this.translatex);
                })
                this.anchorindex = (this._set_items || this.slide_items).length - 1;
                this.no_next = true;
                this.no_prev = false;
            } else if ((this.center?this.anchorindex:this._coords.lt_ix) == 0
                       && tx > 0) {
                this.showing = true;
                if (!this.center) {
                    this.translatex = 0;
                    this._recalibrateCoords(tx - this.translatex);
                } else {
                    requestAnimationFrame(() => {
                        let ir = this.slide_items[0].
                            getBoundingClientRect();
                        let pr = this.getBoundingClientRect();
                        let l = pr.left + this.clientWidth/2;
                        this.translatex += (l - ir.left - (
                            this.slide_items[0].clientWidth + gap)/2);
                        this._recalibrateCoords(tx - this.translatex);
                    })
                }
                this.no_next = false;
                this.no_prev = true;
                this.anchorindex = 0;
            }
            if (this.showing)
                this._updateActive();
        }
        if (this.loop || !this.showing) {
            let ix = !this.center?this._coords.lt_ix:this._getCenterItem(dir);
            if (dir == 'R') {
                this._show(this._getSetIndex(ix), dir);
            } else if (dir == 'L') {
                this._show(this._getSetIndex(
                    ix == last_ix?(!this.loop?last_ix:0):(ix + 1)), dir);
            }
        }
    }
    public next() {
        log("next - anchor ", this.anchorindex);
        if (!this._set_items) {
            if (this.loop) {
                return this._show((this.anchorindex == this.slide_items.length - 1)
                        ?0:(this.anchorindex + 1), 'L');
            } else if (this.anchorindex < this.slide_items.length - 1) {
                return this._show(this.anchorindex + 1, 'L');
            }
        } else {
            if (this.loop) {
                let nxt_ix = (this.anchorindex == this._set_items.length - 1)
                    ?0:(this.anchorindex + 1);
                let cur_order = parseInt(this.slide_items[
                    this._set_items[this.anchorindex]].style.order || "0", 10)
                let nxt_order = parseInt(this.slide_items[
                    this._set_items[nxt_ix]].style.order || "0", 10)
                if (nxt_order < cur_order) {
                    let tx = 0;
                    for (let i = this._set_items[nxt_ix];
                         i < (nxt_ix == this._set_items.length - 1?
                                this.slide_items.length:
                                this._set_items[nxt_ix + 1]);
                         i++) {
                        let el = this.slide_items[i];
                        el.style.order = `${cur_order}`;
                        tx += el.offsetWidth;
                    }
                    this.translatex += tx;
                }
                return this._show(nxt_ix, 'L');
            } else if (this.anchorindex < this._set_items.length - 1) {
                return this._show(this.anchorindex + 1, 'L');
            }
        }
        return null;
    }
    public prev() {
        log("prev - anchor ", this.anchorindex)
        if (!this._set_items) {
            if (this.loop)
                return this._show(((this.anchorindex == 0)
                    ?this.slide_items.length:this.anchorindex) - 1, 'R');
            else if (this.anchorindex > 0)
                return this._show(this.anchorindex - 1, 'R');
        } else {
            if (this.loop) {
                let nxt_ix = ((this.anchorindex == 0)
                    ?this._set_items.length:this.anchorindex) - 1;
                let cur_order = parseInt(this.slide_items[
                    this._set_items[this.anchorindex]].style.order || "0", 10)
                let nxt_order = parseInt(this.slide_items[
                    this._set_items[nxt_ix]].style.order || "0", 10)
                if (cur_order < nxt_order) {
                    let tx = 0;
                    for (let i = this._set_items[nxt_ix];
                         i < (this.anchorindex == this._set_items.length - 1?
                                this.slide_items.length:this._set_items[this.anchorindex + 1]);
                         i++) {
                        let el = this.slide_items[i];
                        el.style.order = `${cur_order}`;
                        tx += el.offsetWidth;
                    }
                    this.translatex -= tx;
                }
                return this._show(nxt_ix, 'R');
            } else if (this.anchorindex > 0)
                return this._show(this.anchorindex - 1, 'R');
        }
        return null;
    }
    private _animationEndEvent() {
        this._animated_queue.shift();
        if (this._animated_queue.length == 0)
            this.showing = false;
    }
    private _show(ix:number, dir:string) {
        return new Promise(resolve => {
        let gap = this._getGap();
        let pr = this.getBoundingClientRect();
        let last_ix = this.slide_items.length - 1;
        let _ix = ix;

        this.anchorindex = ix;
        if (this._set_items) {
            _ix = ix = this._set_items[ix];
        }
        if (this.showing) {
            this._animated_queue = [];
            this.showing = false;
        }
        if (!this.loop && dir == 'R' && ix > this._coords.lt_ix && !this.center)
            ix = this._coords.lt_ix;
        _ix = ix
        this.no_next = this.no_prev = false;
        if (!this.loop) {
            if (this.anchorindex == ((this._set_items ||
                                      this.slide_items).length - 1))
                this.no_next = true;
            if (this.anchorindex == 0)
                this.no_prev = true;
            if (!this.center) {
                if (dir == 'L' && this._coords.rt_ix == last_ix &&
                    this._coords.lt_limit.right > this._coords.rt_limit.right) {
                    /*If left and last element has no room further if the
                     * current left end moves out, then retain the cur left
                     * as the index
                     */
                    _ix = this._coords.lt_ix;
                    this._coords.no_next = true;
                } else if (dir == 'R' && this._coords.lt_ix == 0) {
                    _ix = 0;
                }
                if (dir == 'R' && this.anchorindex > _ix)
                    this.anchorindex = _ix;
            }
        }
        log("_show: ix ", ix, ", _ix ", _ix, ", cur lt ix ", this._coords.lt_ix);

        requestAnimationFrame(() => {
            let ir = this.slide_items[_ix].getBoundingClientRect();
            let tx = this._calcRightLeftIndices(_ix, dir, (_ix != this._coords.lt_ix?ir.left - pr.left:0));

            this.translatex += tx
            this._animated_queue.push({'direction': dir});

            requestAnimationFrame(() => {
                let ir = this.slide_items[this.center?_ix:ix]
                   .getBoundingClientRect();
                let span = !this.center?((pr.left - gap) - ir.left):(
                    (pr.right - pr.left)/2 -
                    this.slide_items[ix].offsetWidth/2  +
                    pr.left - ir.left - gap/2
                    ); /*gap - for the negative - margin*/

                log("  Showing - ", _ix, "  span ", span);
                if (!this.loop) {
                    if (!this.center) {
                        if (dir == 'L' && this._coords.rt_ix == last_ix) {
                            span = Math.max(span, 0 - this._coords.rt_limit.right)
                        } else if (dir == 'R' && this._coords.lt_ix == 0) {
                            span = Math.max(span, 0);
                        }
                    }
                }
                let revise_coord_limit = (limit:ItemLimit) => {
                    limit.left = limit.left + span;
                    limit.right = limit.right + span;
                    limit.tleft = limit.tleft + span;
                    limit.tright = limit.tright + span;
                }
                if (span)  {
                    this.translatex += span;
                    this.showing = true;
                    revise_coord_limit(this._coords.lt_limit);
                    revise_coord_limit(this._coords.rt_limit);
                    revise_coord_limit(this._coords.c_limit);
                }
                this._updateActive();
                this._startTimer();
                resolve(0);
            })
        })
        });
    }
    public show(index:number) {
        if (index > (this._set_items || this.slide_items).length - 1)
            return
        if (index == this.anchorindex)
            return;
        return this._show(index, index > this.anchorindex?'L':'R')
    }
}
