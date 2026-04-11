import {LitElement, html} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import {ResponsiveVal, eventBus,
        getResponsiveValues, parseAttrVal, screen_size} from "./utils";
import {computePosition, autoUpdate, offset}
    from "@floating-ui/dom";
import {styleMap} from 'lit/directives/style-map.js';

const _transAnimate = (x:string, y:string):{[key:string]:object|string} => {
    return {open: {'start': function(el:HTMLElement) {el.style.transform = `translate(${x}, ${y})`},
                   'end': function(el:HTMLElement) {el.style.transform = `translate(0px, 0px)`}},
            close: {'start': function(el:HTMLElement) {el.style.transform = `translate(0px, 0px)`},
                    'end': function(el:HTMLElement) {el.style.transform = `translate(${x}, ${y})`}},
            transition: "transform"}
}
const trans_defs:{[key:string]:any} = {
    b2t: _transAnimate("0px", "100%"),
    t2b: _transAnimate("0px", "-100%"),
    r2l: _transAnimate("100%", "0px"),
    l2r: _transAnimate("-100%", "0px"),
    appear: {
        open: {'start': function(el:HTMLElement) {el.style.opacity = '0';el.style.transform = 'scale(0.9)'},
               'end': function(el:HTMLElement) {el.style.opacity = '1';el.style.transform = 'scale(1)'}},
        close: {'start': function(el:HTMLElement) {el.style.opacity = '1';el.style.transform = 'scale(1)'},
                'end': function(el:HTMLElement) {el.style.opacity = '0';el.style.transform = 'scale(0)'}},
        transition: 'transform,opacity'
    },
    fade: {open: {'start': function(el:HTMLElement) {el.style.opacity = '0'}, 'end': function(el:HTMLElement) {el.style.opacity = '1'}},
           close: {'start': function(el:HTMLElement) {el.style.opacity = '1'}, 'end': function(el:HTMLElement) {el.style.opacity = '0'}},
           transition: "opacity"}
}

@customElement('aalam-tabs')
export class AalamTabs extends LitElement {
    DEFAULT_VALUES:{[key:string]: any} = {
        animationDur: 100,
        activecls: 'tab-active',
        fashion: 'xs:row',
        colsize: "title:30%;body:70%",
        olclosesel: '.tab-close',
        olopts: 'closesel:.tab-close;covered:false',
        colopts: "size.title:30%;size.body:70%;hdr.sel:.tab-col-hdr;hdropensel:.tab-col-hdr-open"
    }

    @property({type:String, attribute:true})
    animation = '';

    @property({type:Number, attribute:true})
    animationDur = this.DEFAULT_VALUES.animationDur;

    @property({type:String, attribute:true})
    activecls = this.DEFAULT_VALUES.activecls;

    @property({type:String, attribute:true})
    fashion = this.DEFAULT_VALUES.fashion;

    @property({type:String, attribute:true})
    colsize = this.DEFAULT_VALUES.colsize;

    @property({type:String, attribute:true})
    olboundsel:String;

    @property({type:String, attribute:true})
    olclosesel = this.DEFAULT_VALUES.olclosesel;

    @property({type:String, attribute:true})
    olopts = this.DEFAULT_VALUES.olopts;

    @property({type:String, attribute:true})
    colopts = this.DEFAULT_VALUES.colopts;

    @state()
    _internal_fashion:string = 'row';

    @query('[part=tab-body-holder]')
    _tab_body_hldr_el:HTMLElement;

    @query('#tab-title-holder')
    _tab_title_hldr_el:HTMLElement;

    private _cur_ix:number|null;
    private _transient_el:HTMLElement| null;
    private _resizeListener = this._resizeEvent.bind(this);
    private _popstateListener = this._popStateHandler.bind(this);
    private _mutation_listener = this.__mutationListener.bind(this);
    private _pushstate_listener = this._busPushEvent.bind(this);
    private _animation_styles:{[key:string]:any}[] = [];
    private _animation_style:{[key:string]:string} = {};
    private _column_size:{[key:string]:string} = {title:'30%', body:'70%'};
    private _column_hdr_sel:string = '.tab-col-hdr';
    private _column_hdr_open_sel: string = '.tab-col-hdr-open';
    private _fashion_style:Array<ResponsiveVal> =
                [{ll: 0, ul: null, val: "row", cond: "(min-width:0px)"}];
    private olcovered:boolean;
    private _mut_observer:MutationObserver;
    private _int_observer:IntersectionObserver;
    private pushpop_signature:string;
    private pushpop_map:string[] = [];
    private _cleanup: (() => void) | null = null;

    constructor() {
        super();
        this.pushpop_signature = Math.random().toString(36);
    }
    override attributeChangedCallback(
                name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'animation') {
            if (trans_defs[new_val])
                this._animation_styles = [{val: {open: new_val, close: new_val}, ll: 0, ul: null}]
            else {
                let tmp = parseAttrVal(new_val, (v:string) => {
                    return v in trans_defs;
                });
                let screen_size_map:{[key:string]:any} = {};
                for (let k of Object.keys(tmp)) {
                    let spl = k.split(".");
                    if (spl.length != 1 && spl.length != 2)
                        continue;
                    if ((spl[0] != 'show' && spl[0] != 'hide') ||
                        (spl.length == 2 && screen_size.indexOf(spl[1]) < 0))
                        continue;
                    let size = spl.length == 1?'':spl[1];
                    if (!(size in screen_size_map))
                        screen_size_map[size] = {}
                    screen_size_map[size][spl[0]] = tmp[k];
                }
                if ('' in screen_size_map) {
                    for (let size of screen_size) {
                        if (!(size in screen_size_map))
                            screen_size_map[size] = screen_size_map[''];
                    }
                }
                delete screen_size_map[''];
                let resp_val = [];
                for (let sz of Object.keys(screen_size_map)) {
                    let val = screen_size_map[sz]
                    resp_val.push(`${sz}:${val['show'] || ''},${val['hide'] || ''}`);
                }
                for (let v of getResponsiveValues(resp_val.join(";"), {})) {
                    let tmp = v['val'].split(",");
                    let _v:{[key:string]:any} = {...v}
                    _v['val'] = {open: tmp[0] || null, close: tmp[1] || null};
                    this._animation_styles.push(_v);
                }
            }
            this._animation_style = this._checkAnimationStyle();
        } else if (name == 'fashion') {
            let valids = ['row', 'column', 'accordion', 'overlay'];
            this._fashion_style = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.fashion, (v:string) => {
                    return valids.indexOf(v) >= 0;
                });
            let val = this._checkFashion();
            if (val != this._internal_fashion)
                this._changeFashionStyle(val);
        } else if (name == "colsize") {
            this._column_size = parseAttrVal(new_val, (v:string) => {
                try {
                    CSS.supports("grid-template-columns", v)
                    return true;
                } catch (err:any) {}
                    return false;
            });
        } else if (name == 'olopts') {
            let val = parseAttrVal(new_val);
            this.olboundsel = val.boundsel;
            this.olclosesel = val.closesel || this.olclosesel || this.DEFAULT_VALUES.olclosesel;
            this.olcovered = ['true', '1'].indexOf((val.covered || "").toLowerCase()) >= 0;
        } else if (name == 'colopts') {
            let val = parseAttrVal(new_val, (v:string, k:string) => {
                if (k == 'size.title' || k == 'size.body') {
                    try {
                        CSS.supports('grid-template-columns', v);
                        return true;
                    } catch(err:any) {}
                    return false;
                }
                return true;
            })
            this._column_size = {title: val['size.title'] || '30%',
                                 body: val['size.body'] || '70%'};
            this._column_hdr_sel = val['hdr.sel'] || '.tab-col-hdr';
            this._column_hdr_open_sel = val['hdr.opensel'] || '.tab-col-hdr-open';
        }
    }
    override render() {
        if (this._internal_fashion == 'accordion') {
            return html`
<div @click=${this._titleClicked}
     @transitionend=${this._transitionEndEvent}>
    <slot name='acc'></slot>
</div>`
        } else {
            let title_style_map:{[key:string]:string} = {};
            let body_style_map:{[key:string]:string|number} = {'display': 'block'};
            if (this._internal_fashion == 'column') {
                title_style_map = {
                    display: 'grid',
                    'grid-template-columns': `
                        ${this._column_size.title} ${this._column_size.body}`
                }
                /*In case of animations the tab-body will be in absolute position*/
                body_style_map['position'] = 'relative';
            } else if (this._internal_fashion == 'overlay') {
                body_style_map = {position: 'fixed', display: 'none', top: 0, left: 0};
            }
            let body_click_fn = (this._internal_fashion == 'overlay'?this._bodyClicked:null)
            let flex_dir = (this._internal_fashion == 'row'?'row':'column')
            return html`
<div style=${styleMap(title_style_map)} part="tab-root">
    <div part="tab-title-holder tab-title-holder-${this._internal_fashion}" id="tab-title-holder">
        <div part="tab-title tab-title-${this._internal_fashion}" style="display:flex;flex-direction:${flex_dir}">
            <slot name="tab-title" @click=${this._titleClicked}></slot>
        </div>
    </div>
    <div style=${styleMap(body_style_map)} @transitionend=${this._transitionEndEvent} part="tab-body-holder" @click=${body_click_fn}>
        <slot name="tab-body"></slot>
    </div>
</div>`
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.setAttribute('data-fashion', this._internal_fashion);
        this.renderRoot.addEventListener("slotchange", (e) => {
                                         this._slotChangedEvent(e)});
        window.addEventListener("resize", this._resizeListener);
        this._mut_observer = new MutationObserver(this._mutation_listener);
        this._mut_observer.observe(this, { attributes:true, childList: true, subtree : true});
        this._int_observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if(!entry.isIntersecting && this._internal_fashion == 'overlay') {
                        this._cleanupOverlay();
                    }
                });
            })
        this._int_observer.observe(this);
        window.addEventListener("popstate", this._popstateListener)
    }
    override disconnectedCallback() {
        window.removeEventListener("resize", this._resizeListener);
        window.removeEventListener('postate', this._popstateListener);
        if (this._mut_observer) {
            this._mut_observer.disconnect();
        }
        if (this._int_observer) {
            this._int_observer.disconnect();
        }
        if (this._cleanup) {
            this._cleanup();
            this._cleanup = null;
        }
    }
    override firstUpdated() {
        this._openActive();
        if (this._cur_ix == null && this._internal_fashion != 'overlay') {
            let titles = Array.from(this._queryTitles());
            for (let i = 0; i < titles.length; i++) {
                if (titles[i].matches(this._column_hdr_sel)) continue;
                this.show(i);
                break;
            }
        }
    }
    override updated() {
        if (this._internal_fashion == 'overlay' && !this._cleanup)
            this._setupOverlay();
        else if (this._internal_fashion != 'overlay' && this._cleanup) {
            this._cleanup();
            this._cleanup = null;
        }
    }
    private _queryTitles(fashion?:string) {
        fashion = fashion || this._internal_fashion;
        return this.querySelectorAll(fashion == 'accordion'?':scope > [slot=acc] > [slot=tab-title]:not(:empty)':':scope > [slot=tab-title]');
    }
    private _queryBody(fashion?:string) {
        fashion = fashion || this._internal_fashion;
        return this.querySelectorAll(fashion == 'accordion'?':scope > [slot=acc] > [slot=tab-body]:not(:empty)':':scope > [slot=tab-body]');
    }
    private __mutationListener(mutations:MutationRecord[]) {
        let num_added_nodes = 0;
        for (let record of mutations) {
            num_added_nodes += record.addedNodes.length;
            if (record.attributeName == 'class') {
                let el = <Element>record.target;
                if (el.slot == 'tab-title' && el.classList.contains(this.activecls)) {
                    let ix = [...this._queryTitles()].indexOf(el)
                    if (ix >= 0 && this._cur_ix != ix)
                        this.show(ix);
                }
            }
            if (this._internal_fashion == 'accordion') {
                record.removedNodes.forEach((_el) => {
                    let pnt = <HTMLElement>record.target;
                    let el = <HTMLElement>_el;
                    if ((el.slot == 'tab-title' || el.slot == 'tab-body') && pnt.slot == 'acc') {
                        if (pnt.children.length == 0) {
                            pnt.remove();
                        }
                    }
                })
            }
            if (record.removedNodes.length > 0) {
                const removed = Array.from(record.removedNodes) as HTMLElement[];
                const isTabNode = removed.some(n =>
                    (n as Element).matches?.('[slot=tab-title],[slot=tab-body],[slot=acc]')
                );
                if (isTabNode) {
                    const prev_ix = this._cur_ix;
                    this._cur_ix = null;
                    if (prev_ix !== null) {
                        setTimeout(() => {
                            const titles = this._queryTitles();
                            if (titles.length > 0) {
                                let next_ix = Math.min(prev_ix, titles.length - 1);
                                if (this._column_hdr_sel != null && titles[next_ix].matches(this._column_hdr_sel)) {
                                    let found = false;
                                    for (let i = next_ix + 1; i < titles.length; i++) {
                                        if (!titles[i].matches(this._column_hdr_sel)) {
                                            next_ix = i;
                                            found = true;
                                            break
                                        }
                                    }
                                    if (!found) {
                                        for (let i = next_ix - 1; i >= 0; i--) {
                                            if (!titles[i].matches(this._column_hdr_sel)) {
                                                next_ix = i;
                                                break
                                            }
                                        }
                                    }
                                }
                                this.show(next_ix);
                            }
                        }, 0);
                    }
                }
            }
        }
        if (this._internal_fashion == 'accordion' && num_added_nodes > 0)
            this._showAccordion();
    }
    private _setupOverlay() {
        if (this._cleanup) {
            this._cleanup();
            this._cleanup = null;
        }

        const ref_el = (this.olboundsel?(document.querySelector(`${this.olboundsel}`) as HTMLElement):null) ||
                this._tab_title_hldr_el as HTMLElement;

        if (!ref_el) {
            return;
        }

        this._cleanup = autoUpdate(ref_el, this._tab_body_hldr_el, () => {
            computePosition(ref_el, this._tab_body_hldr_el, {
                strategy: 'fixed',
                placement: 'bottom-start',
                middleware: [
                offset(({rects}) => {
                  return -rects.reference.height;
                })
                ],
            }).then((data) => {
                let ref_bounds = ref_el.getBoundingClientRect();
                let {x, y} = data;
                Object.assign(this._tab_body_hldr_el.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${ref_bounds.width}px`,
                    height: `${ref_bounds.height}px`,
                    overflow: "auto"
                });
            });
        });
    }
    private _cleanupOverlay() {
        if (this._cur_ix == null)
            return;

        let title = this._queryTitles();
        let body = this._queryBody();
        this._hideBody(this._cur_ix, <HTMLElement>body[this._cur_ix], <HTMLElement>title[this._cur_ix], true);
        this._cur_ix = null;
    }
    private _slotChangedEvent(event:Event) {
        if (!event.target)
            return;
        let nodes = (event.target as HTMLSlotElement).assignedElements();
        let name = (event.target as HTMLSlotElement)?.name;
        if (name == 'tab-body' || name == 'tab-title') {
            for(let i of nodes) {
                if (this._cur_ix == null || i != (nodes[<number>this._cur_ix])) {
                    if (name == 'tab-body')
                        (i as HTMLElement).style.display = 'none';
                    i.classList.remove(this.activecls);
                }
            }
        } else if (name == 'acc') {
            for(let i of nodes) {
                if (this._cur_ix != null && i != (nodes[<number>this._cur_ix])) {
                    if (i.children.length > 1) {
                        (i.children[1] as HTMLElement).style.display = 'none';
                        i.children[1].classList.remove(this.activecls);
                    }
                    if (i.children.length > 0) {
                        i.children[0]?.classList.remove(this.activecls);
                    }
                }
            }
        }
    }
    private _openActive() {
        if (this._internal_fashion == 'overlay')
            return;
        let val = this._queryTitles();
        for(let i = 0;i < val.length; i++) {
            if (val[i].classList.contains(this.activecls)) {
                this.show(i);
                break;
            }
        }
    }
    private _checkAnimationStyle(): {[key:string]:string} {
        let vw = window.innerWidth;
        for(let style of this._animation_styles)
            if ((style.ll || 0) <= vw && (
                    !style.ul || style.ul >= vw))
                return style.val;
        return {};
    }
    private _checkFashion():string {
        let vw = window.innerWidth;
        for(let style of this._fashion_style)
            if ((style.ll || 0) <= vw && (
                    !style.ul || style.ul >= vw))
                return style.val;
        return '';
    }
    private _changeFashionStyle(val:string) {
        this.setAttribute('data-fashion', val);
        if (this._tab_body_hldr_el) {
            Object.assign(this._tab_body_hldr_el.style, {
                left: "",
                top: "",
                width: "",
                height: "",
                overflow: "",
                display: ""
            });
        }
        if (val == 'accordion')
            this._showAccordion();
        else {
            this._showRC();
            if (val == 'overlay') {
                if (this._cur_ix)
                    this.dispatchEvent(
                        new CustomEvent("hide", {detail:this._cur_ix}));
                this._cur_ix = null;
                let body = this._queryBody()
                for (let b of body) {
                    (b as HTMLElement).style.display = "none";
                }
            }
        }
        this._internal_fashion = val;
    }
    private _resizeEvent() {
        this._animation_style = this._checkAnimationStyle();
        let val = this._checkFashion();
        if (this._internal_fashion != val) {
            this._changeFashionStyle(val);
            this._openActive();
            if (this._cur_ix == null && this._internal_fashion != 'overlay')
                this.show(0);
        }
    }
    private _popStateHandler() {
        if (this._internal_fashion === 'overlay' && this.olcovered) {
            if (this.pushpop_map.length == 1 && this.pushpop_map[0] == this.pushpop_signature) {
                this._cleanupOverlay();
                eventBus.removeEventListener('__push__', this._pushstate_listener)
            }
            this.pushpop_map.pop();
        }
    }
    private _busPushEvent(ev:Event) {
        /* This handles the event raised by an overlay aalam-tab child within this element,
         * in that we add to the pop signatures and we pop the current overlay when the
         * map of this element comes to 1*/
        let event = <CustomEvent>ev;
        if (event.detail['__sign__'] != null && event.detail['__sign__'] != this.pushpop_signature)
            this.pushpop_map.push(event.detail['__sign__']);
    }
    private _showAccordion() {
        let title = this._queryTitles('row');
        let body = this._queryBody('row');
        for (let i = 0;i < Math.min(title.length, body.length); i++) {
            let div = document.createElement("div");
            div.slot = "acc";
            div.appendChild(title[i]);
            div.appendChild(body[i]);
            this.appendChild(div);
        }
    }
    private _showRC() {
        let acc = this.querySelectorAll(":scope > [slot=acc]");
        for(let j of acc) {
            this.appendChild(j.children[1]);
            this.appendChild(j.children[0]);
            j.remove();
        }
        let styles = this.querySelectorAll(":scope > style");
        for (let s of styles)
            s.remove();
    }
    private _titleClicked(e:Event) {
        let title = this._queryTitles();
        let el = e.target as HTMLElement;
        if (el.closest('aalam-tabs') != this) return;
        if (this._internal_fashion == 'overlay' && !this._cleanup)
            this._setupOverlay();
        const slot_el = el.closest("[slot=tab-title]");
        if (!slot_el)
            return;
        if ((this._internal_fashion == 'column' || this._internal_fashion == 'overlay') &&
                this._column_hdr_sel && slot_el.matches(this._column_hdr_sel) &&
                this._column_hdr_open_sel && !el.closest(this._column_hdr_open_sel)) {
            /*If this is a column header then any click outside the open-sel should not open the tab body*/
            return;
        }
        let ix = Array.prototype.indexOf.call(title, slot_el);
        this.show(ix);
    }
    private _bodyClicked(e:Event) {
        let el = e.target as HTMLElement;
        let _sel = el.matches(this.olclosesel)?el:el.closest(this.olclosesel);
        if (!_sel || _sel.closest('aalam-tabs') != this)
            return;
        let title = this._queryTitles();
        let body = this._queryBody();
        if (this._cur_ix != null)
            this._hideBody(this._cur_ix, <HTMLElement>body[this._cur_ix], <HTMLElement>title[this._cur_ix], true);
        this._cur_ix = null;
    }
    private _transitionEndEvent(e:Event) {
        let el = e.target as HTMLElement;

        if ((el.closest('aalam-tabs') != this || el.slot != 'tab-body') && !el.part.contains('tab-body-holder')) {
            return;
        }

        if ((el.slot == 'tab-body' && !el.classList.contains(this.activecls)) ||
            (el.part.contains('tab-body-holder') && this._cur_ix == null)) {
            if (this._transient_el) {
                this._transient_el.style.display = 'none';
                this._transient_el = null;
            }
            el.style.display = 'none';
        }
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.transitionProperty = '';
        el.style.transitionDuration = '';
        el.style.transitionTimingFunction = '';
        el.style.transition = '';
        if (this._tab_body_hldr_el)
            this._tab_body_hldr_el.style.overflow = "";
    }
    private _setTransition(el:HTMLElement, val:string, prop:string) {
        if (this._animation_style[val])
            return trans_defs[this._animation_style[val]][val][prop](el);
    }
    private _hideBody(ix:number|null, bpix:HTMLElement, tpix:HTMLElement, is_overlay:boolean, rect?:DOMRect) {
        bpix.classList.remove(this.activecls);
        tpix.classList.remove(this.activecls);
        if (!rect)
            rect = this.getBoundingClientRect();

        /*Pop state addition for the overlay mode*/
        if (history.state?.__overlay_open__ && history.state?.__sign__ == this.pushpop_signature) {
            history.back();
        }

        if (is_overlay) {
            this._transient_el = bpix;
            bpix = this._tab_body_hldr_el;
            if (this.olboundsel) {
                let ref = <HTMLElement>document.querySelector(<string>this.olboundsel);
                if (ref)
                    ref.style.overflow = "auto";
            }
        }
        if (this._animation_style.close && rect.width > 0) {
            this._tab_body_hldr_el?.style.setProperty("overflow", "hidden", "important");
            requestAnimationFrame( () => {
                this._setTransition(bpix, 'close', 'start');
                bpix.style.transition = "none";
                requestAnimationFrame( () => {
                    bpix.style.transition = '';
                    bpix.style.transitionProperty = trans_defs[this._animation_style['close']]['transition'];
                    bpix.style.transitionDuration =
                        `${this.animationDur}ms`;
                    bpix.style.transitionTimingFunction = 'ease';
                    this._setTransition(bpix, 'close', 'end')
                });
            });
        } else {
            bpix.style.display = 'none';
            if (this._transient_el) {
                this._transient_el.style.display = 'none';
                this._transient_el = null;
            }
        }
        this.dispatchEvent(
            new CustomEvent("hide", {detail:{ix}}));
    }
    private _show(ix:number, prev_ix:number|null) {
        let title = this._queryTitles();
        let body = this._queryBody();
        /*When the element is not show, we need not wait for the transition end event*/
        let rect = this.getBoundingClientRect();
        let bix = body[ix] as HTMLElement;

        if (prev_ix != null && body[prev_ix] && title[prev_ix] ) {
            this._hideBody(prev_ix, <HTMLElement>body[prev_ix], <HTMLElement>title[prev_ix], false, rect)
        }
        title[ix]?.classList.add(this.activecls);
        bix?.classList.add(this.activecls);
        this._cur_ix = ix;
        if (bix)
            bix.style.display = 'block';
        if (this._internal_fashion != 'accordion')
            this._tab_body_hldr_el.style.display = 'block';
        if (this._internal_fashion == 'overlay') {
            if (this.olboundsel) {
                let ref = <HTMLElement>document.querySelector(<string>this.olboundsel);
                if (ref)
                    ref.style.overflow = "hidden";
            }
            if (this.olcovered) {
                if (history.state?.['__overlay_open__'])
                    eventBus.dispatchEvent(new CustomEvent('__push__', {
                        bubbles: true,
                        composed: true,
                        detail: {'__sign__': this.pushpop_signature}}));

                history.pushState({ __overlay_open__: true, __sign__: this.pushpop_signature }, '', '');
                eventBus.addEventListener("__push__", this._pushstate_listener)
                this.pushpop_map.push(this.pushpop_signature)
            }
        }
        if (this._animation_style.open && rect.width > 0) {
            this._tab_body_hldr_el?.style.setProperty("overflow", "hidden", "important");
            if (this._internal_fashion == 'overlay') {
                bix = this._tab_body_hldr_el;
            }
            requestAnimationFrame( () => {
                this._setTransition(bix, 'open', 'start');
                bix.style.transition = 'none';
                requestAnimationFrame( () => {
                    bix.style.transition = '';
                    bix.style.transitionProperty = trans_defs[this._animation_style['open']]['transition'];
                    bix.style.transitionDuration = `${this.animationDur}ms`;
                    bix.style.transitionTimingFunction = 'ease';
                    this._setTransition(bix, 'open', 'end');
                })
            })
        }
        this.dispatchEvent(
            new CustomEvent("show", {detail:{ix}}));
    }
    show(ix:number) {
        if (this._cur_ix == ix && this._cur_ix != null) {
            let title = this._queryTitles();
            let body = this._queryBody();
            if (!title[ix].classList.contains(this.activecls))
                title[ix].classList.add(this.activecls);
            if (!body[ix].classList.contains(this.activecls))
                body[ix].classList.add(this.activecls);
            return
        }
        if (ix == null && this._cur_ix != null){
            let title = this._queryTitles();
            let body = this._queryBody();
            this._hideBody(this._cur_ix, <HTMLElement>body[this._cur_ix], <HTMLElement>title[this._cur_ix], true);
            this._cur_ix = null;
            return;
        }
        this._show(ix, this._cur_ix);
        this.dispatchEvent(
            new CustomEvent("change", {detail:{ix}}));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-tabs":AalamTabs;
    }
}
