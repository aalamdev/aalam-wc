import {LitElement, html} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {animate_defs, animationCSS, ResponsiveVal,
        getResponsiveValues, parseAttrVal} from "./utils";
import {styleMap} from 'lit/directives/style-map.js';

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
    private _anim_number:string;
    private _resizeListener = this._resizeEvent.bind(this);
    private _node_insert_listener = this._nodeInserted.bind(this);
    private _animation_styles:{[key:string]:string} = {};
    private _column_size:{[key:string]:string} = {title:'30%', body:'70%'};
    private _fashion_style:Array<ResponsiveVal> =
                [{ll: 0, ul: null, val: "row", cond: "(min-width:0px)"}];

    constructor() {
        super();
        this._anim_number = Math.random().toString(16).slice(2, 10);
    }
    override attributeChangedCallback(
                name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'animation') {
            if(animate_defs[new_val])
                this._animation_styles = {open: new_val, close: new_val}
            else {
                this._animation_styles = parseAttrVal(new_val, (v:string) => {
                    try {
                        if(Object.keys(animate_defs[v]))
                            return true;
                        else
                            return false;
                    } catch (err:any) {}
                        return false;
                });
                this._animation_styles = Object.assign(
                    {open:this._animation_styles?.show,
                     close:this._animation_styles?.hide}, {});
            }
        } else if(name == 'fashion') {
            this._fashion_style = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.fashion, (v:string) => {
                    try {
                        if(v == 'row' || v == 'column' || v == 'accordion')
                            return true;
                        else
                            return false;
                    } catch (err:any) {}
                        return false;
                });
            let val = this._checkFashion();
            if(val != this._internal_fashion)
                this._changeFashionStyle(val);
        } else if(name == "colsize") {
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
        if(this._internal_fashion == 'accordion') {
            return html`
<div @click=${this._titleClicked}
     @animationend=${ (event:any) => this._closeEnd(event)}>
    <slot name='acc'></slot>
</div>`
        } else {
            let fashionColumn:any = {
                display: 'grid',
                'grid-template-columns': `
                    ${this._column_size.title} ${this._column_size.body}`
            }
            return html`
${this._animateStyles()}
<div style=${this._internal_fashion=='column'?
                styleMap(fashionColumn):''}>
    <div id="title-tab" style=
        "display:flex;
         flex-direction:${this._internal_fashion}">
        <slot name="tab-title" @click=${this._titleClicked}></slot>
    </div>
    <div id="body-tab" @animationend=${ (event:any) => this._closeEnd(event)}>
        <slot id="body-slot" name="tab-body"></slot>
    </div>
</div>`
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", (e) => {
            this._slotChangedEvent(e)});
        window.addEventListener("resize", this._resizeListener);
        this.addEventListener("DOMNodeInserted", this._node_insert_listener);
    }
    override disconnectedCallback() {
        window.removeEventListener("resize", this._resizeListener);
        this.removeEventListener("DOMNodeInserted", this._node_insert_listener);
    }
    override firstUpdated() {
        if(!this.animation || (
                !this._animation_styles.open && !this._animation_styles.close))
            this.animationDur = 0;
        this._openActive();
    }
    private _nodeInserted(event:Event) {
        let el = event.target as HTMLElement;
        if (this._internal_fashion != 'accordion')
            return;
        if(el.matches("[slot=tab-title]") || el.matches("[slot=tab-body]"))
            this._showAccordion();
        else
            return;
    }
    private _slotChangedEvent(event:Event) {
        if(!event.target)
            return;
        let nodes = (event.target as HTMLSlotElement).assignedElements();
        let name = (event.target as HTMLSlotElement)?.name;
        if(name == 'tab-body') {
            for(let i of nodes)
                if(!i.classList.contains(this.activecls))
                    (i as HTMLElement).style.display = 'none';
        } else if(name == 'acc') {
            for(let i of nodes)
                if(!i.children[1].classList.contains(this.activecls))
                    (i.children[1] as HTMLElement).style.display = 'none';
        }
    }
    private _openActive() {
        let val = this.querySelectorAll("[slot=tab-title]");
        for(let i = 0;i < val.length; i++) {
            if(val[i].classList.contains(this.activecls)) {
                this.show(i);
                break;
            }
        }
        if(this._cur_ix == null)
            this.show(0);
    }
    private _checkFashion():string {
        let vw = window.innerWidth;
        for(let style of this._fashion_style)
            if((style.ll || 0) <= vw && (
                    !style.ul || style.ul >= vw)) {
                return style.val;
            }
        return '';
    }
    private _changeFashionStyle(val:string) {
        this._internal_fashion = val;
        if(val == 'accordion')
            this._showAccordion();
        else
            this._showRC();
    }
    private _resizeEvent() {
        let val = this._checkFashion();
        if(this._internal_fashion != val) {
            this._changeFashionStyle(val);
            this._openActive();
        }
    }
    private _showAccordion() {
        if(this.animationDur || (
                this._animation_styles.open || this._animation_styles.close)) {
            let style = document.createElement("style");
            style.innerHTML = `${animationCSS(
                `.__tab-anim-open-${this._anim_number}`, 
                `.__tab-anim-close-${this._anim_number}`,
                this._animation_styles, this.animationDur)}`
            this.appendChild(style);
        }
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
            if(el.slot == "tab-title") {
                let ix = Array.prototype.indexOf.call(title, el);
                this.show(ix);
                break;
            } else if(el.parentElement)
                el = el.parentElement;
        }
    }
    private _animateStyles() {
        if(!this.animationDur || (
                !this._animation_styles.open && !this._animation_styles.close))
            return;
        return html`
<style>
    ${animationCSS(
        `::slotted(.__tab-anim-open-${this._anim_number})`,
        `::slotted(.__tab-anim-close-${this._anim_number})`,
        this._animation_styles,
        this.animationDur)}
</styel>`
    }
    private _closeEnd(event:Event) {
        if((event.target as HTMLElement).classList.contains(
                `__tab-anim-close-${this._anim_number}`))
            (event.target as HTMLElement).style.display = 'none';
        else
            return;
    }
    private _show(ix:number, prev_ix:number) {
        let title = this.querySelectorAll("[slot=tab-title]");
        let body = this.querySelectorAll("[slot=tab-body]");
        if(prev_ix != null) {
            if(this._animation_styles.close)
                body[prev_ix]?.classList.add(
                    `__tab-anim-close-${this._anim_number}`);
            else
                (body[prev_ix] as HTMLElement).style.display = 'none';
            if(this._animation_styles.open)
                body[prev_ix]?.classList.remove(
                    `__tab-anim-open-${this._anim_number}`);
            body[prev_ix]?.classList.remove(this.activecls)
            title[prev_ix]?.classList.remove(this.activecls);
            this.dispatchEvent(
                new CustomEvent("hide", {detail:{ix}}));
        }
        title[ix]?.classList.add(this.activecls);
        body[ix]?.classList.add(this.activecls);
        if(this._animation_styles.open)
            body[ix]?.classList.add(`__tab-anim-open-${this._anim_number}`);
        if(this._animation_styles.close)
            body[ix]?.classList.remove(`__tab-anim-close-${this._anim_number}`);
        if(body[ix])
            (body[ix] as HTMLElement).style.display = 'block';
        this.dispatchEvent(
            new CustomEvent("show", {detail:{ix}}));
    }
    show(ix:number) {
        if(this._cur_ix == ix && this._cur_ix != null)
            return
        let prev_ix = this._cur_ix;
        if(this.animationDur == 0 || (
                !this._animation_styles.open && 
                !this._animation_styles.close)) {
            this._show(ix, prev_ix);
        }
        else
            setTimeout( () => {this._show(ix, prev_ix)}, this.animationDur);
        if(this._cur_ix != ix)
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
