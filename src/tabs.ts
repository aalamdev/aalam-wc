import {LitElement, html} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {ResponsiveVal,
        getResponsiveValues, parseAttrVal} from "./utils";
import {styleMap} from 'lit/directives/style-map.js';

const _transAnimate = (x:string, y:string):{[key:string]:object} => {
    return {open: {'start': `translate(${x}, ${y})`,
                   'end': `translate(0px, 0px)`},
            close: {'start': `translate(0px, 0px)`,
                    'end': `translate(${x}, ${y}`}}
}
const trans_defs:{[key:string]:any} = {
    b2t: _transAnimate("0px", "100%"),
    t2b: _transAnimate("0px", "-100%"),
    r2l: _transAnimate("100%", "0px"),
    l2r: _transAnimate("-100%", "0px"),
    fade: {open: {'start': 0, 'end':1},
           close: {'start': 1, 'end': 0}}
}

@customElement('aalam-tabs')
export class AalamTabs extends LitElement {
    DEFAULT_VALUES:{[key:string]: any} = {
        animationDur: 100,
        activecls: 'tab-active',
        fashion: 'xs:row',
        colsize: "title:30%;body:70%",
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

    @state()
    _internal_fashion:string = 'row';

    private _cur_ix:number;
    private _resizeListener = this._resizeEvent.bind(this);
    private _node_insert_listener = this._nodeInserted.bind(this);
    private _animation_styles:{[key:string]:string} = {};
    private _column_size:{[key:string]:string} = {title:'30%', body:'70%'};
    private _fashion_style:Array<ResponsiveVal> =
                [{ll: 0, ul: null, val: "row", cond: "(min-width:0px)"}];
    private _observer:MutationObserver;

    constructor() {
        super();
    }
    override attributeChangedCallback(
                name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'animation') {
            if (trans_defs[new_val])
                this._animation_styles = {open: new_val, close: new_val}
            else {
                this._animation_styles = parseAttrVal(new_val, (v:string) => {
                    return v in trans_defs;
                });
                this._animation_styles = {
                    open:this._animation_styles?.show,
                    close:this._animation_styles?.hide};
            }
        } else if (name == 'fashion') {
            this._fashion_style = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.fashion, (v:string) => {
                    return (v == 'row' || v == 'column' || v == 'accordion');
                });
            let val = this._checkFashion();
            if (val != this._internal_fashion)
                this._changeFashionStyle(val);
        } else if (name == "colsize") {
            this._column_size = parseAttrVal(new_val, (v:string) => {
                try {
                    CSSStyleValue.parse("grid-template-columns", v)
                    return true;
                } catch (err:any) {}
                    return false;
            });
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
            let fashionColumn:any = {
                display: 'grid',
                'grid-template-columns': `
                    ${this._column_size.title} ${this._column_size.body}`
            }
            return html`
<div style=${this._internal_fashion=='column'?styleMap(fashionColumn):''}>
    <div style="display:flex;flex-direction:${this._internal_fashion}">
        <slot name="tab-title" @click=${this._titleClicked}></slot>
    </div>
    <div @transitionend=${this._transitionEndEvent}>
        <slot name="tab-body"></slot>
    </div>
</div>`
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", (e) => {
                                         this._slotChangedEvent(e)});
        window.addEventListener("resize", this._resizeListener);
        this._observer = new MutationObserver(this._node_insert_listener);
        this._observer.observe(this, { childList: true, subtree : true});

    }
    override disconnectedCallback() {
        window.removeEventListener("resize", this._resizeListener);
        if (this._observer) {
            this._observer.disconnect();
        }
    }
    override firstUpdated() {
        this._openActive();
        if (this._cur_ix == null)
            this.show(0);
    }
    private _nodeInserted(mutations:MutationRecord[]) {
        let num_added_nodes = 0;
        for (let record of mutations)
            num_added_nodes += record.addedNodes.length;
        if (this._internal_fashion == 'accordion' && num_added_nodes > 0)
            this._showAccordion();
    }
    private _slotChangedEvent(event:Event) {
        if (!event.target)
            return;
        let nodes = (event.target as HTMLSlotElement).assignedElements();
        let name = (event.target as HTMLSlotElement)?.name;
        if (name == 'tab-body' || name == 'tab-title') {
            for(let i of nodes) {
                if (i != (nodes[this._cur_ix])) {
                    if (name == 'tab-body')
                        (i as HTMLElement).style.display = 'none';
                    i.classList.remove(this.activecls);
                }
            }
        } else if (name == 'acc') {
            for(let i of nodes) {
                if (i != (nodes[this._cur_ix])) {
                    (i.children[1] as HTMLElement).style.display = 'none';
                    i.children[0].classList.remove(this.activecls);
                    i.children[1].classList.remove(this.activecls);
                }
            }
        }
    }
    private _openActive() {
        let val = this.querySelectorAll("[slot=tab-title]");
        for(let i = 0;i < val.length; i++) {
            if (val[i].classList.contains(this.activecls)) {
                this.show(i);
                break;
            }
        }
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
        this._internal_fashion = val;
        if (val == 'accordion')
            this._showAccordion();
        else
            this._showRC();
    }
    private _resizeEvent() {
        let val = this._checkFashion();
        if (this._internal_fashion != val) {
            this._changeFashionStyle(val);
            this._openActive();
        }
    }
    private _showAccordion() {
        let title = this.querySelectorAll(":scope > [slot=tab-title]");
        let body = this.querySelectorAll(":scope > [slot=tab-body]");
        for (let i = 0;i < Math.min(title.length, body.length); i++) {
            let div = document.createElement("div");
            div.slot = "acc";
            div.appendChild(title[i]);
            div.appendChild(body[i]);
            this.appendChild(div);
        }
    }
    private _showRC() {
        let acc = this.querySelectorAll("[slot=acc]");
        for(let j of acc) {
            this.appendChild(j.children[1]);
            this.appendChild(j.children[0]);
            j.remove();
        }
        let styles = this.querySelectorAll("style");
        for (let s of styles)
            s.remove();
    }
    private _titleClicked(e:Event) {
        let title = this.querySelectorAll("[slot=tab-title]");
        let el = e.target as HTMLElement;
        while(el) {
            if (el.slot == "tab-title") {
                let ix = Array.prototype.indexOf.call(title, el);
                this.show(ix);
                break;
            } else if (el.parentElement) {
                el = el.parentElement;
            } else {
                break;
            }
        }
    }
    private _transitionEndEvent(e:Event) {
        let el = e.target as HTMLElement;
        if (el.hasAttribute("data-anim"))
            el.style.display = 'none';
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.transitionProperty = '';
        el.style.transitionDuration = '';
        el.style.transitionTimingFunction = '';
        el.style.transition = '';
        return;
    }
    private _setTransition(val:string, prop:string) {
        if (this._animation_styles[val])
            return trans_defs[this._animation_styles[val]][val][prop];
    }
    private _show(ix:number, prev_ix:number) {
        let title = this.querySelectorAll("[slot=tab-title]");
        let body = this.querySelectorAll("[slot=tab-body]");
        let bix = body[ix] as HTMLElement;
        if (prev_ix != null) {
            let bpix = body[prev_ix] as HTMLElement;
            if (this._animation_styles.close) {
                let val = `${this._animation_styles.close == 'fade'?
                                  `opacity`:`transform`}`;
                bpix.setAttribute("data-anim", '');
                bpix.style.transitionProperty = val;
                bpix.style.setProperty(
                    val, `${this._setTransition('close', 'start')}`);
                bpix.style.transitionDuration =
                    `${this.animationDur}ms`;
                bpix.style.transitionTimingFunction = 'ease';
                requestAnimationFrame( () => {
                    bpix.style.setProperty(
                        val, `${this._setTransition('close', 'end')}`);
                });
            } else
                bpix.style.display = 'none';
            bpix?.classList.remove(this.activecls);
            title[prev_ix]?.classList.remove(this.activecls);
            this.dispatchEvent(
                new CustomEvent("hide", {detail:{ix}}));
        }
        title[ix]?.classList.add(this.activecls);
        bix?.classList.add(this.activecls);
        if (bix)
            bix.style.display = 'block';
        if (this._animation_styles.open) {
            let val = `${this._animation_styles.open == 'fade'?
                             `opacity`:`transform`}`;
            bix.style.transitionProperty = val;
            bix.style.setProperty(
                val, `${this._setTransition('open', 'start')}`);
            bix.style.transitionDuration = `${this.animationDur}ms`;
            bix.style.transitionTimingFunction = 'ease';
            requestAnimationFrame( () => {
                bix.style.setProperty(
                    val,`${this._setTransition('open', 'end')}`);
            })
        }
        if (this._animation_styles.close)
            bix.removeAttribute("data-anim");
        this.dispatchEvent(
            new CustomEvent("show", {detail:{ix}}));
    }
    show(ix:number) {
        if (this._cur_ix == ix && this._cur_ix != null)
            return
        this._show(ix, this._cur_ix);
        if (this._cur_ix != ix)
            this._cur_ix = ix;
        this.dispatchEvent(
            new CustomEvent("change", {detail:{ix}}));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-tabs":AalamTabs;
    }
}
