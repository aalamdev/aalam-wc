import {LitElement, html} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {animate_defs, animationCSS, ResponsiveVal,
        getResponsiveValues, parseAttrVal} from "./utils";
import {styleMap} from 'lit/directives/style-map.js';

@customElement('aalam-tabs')
export class AalamTabs extends LitElement {
    DEFAULT_VALUES:{ [key:string]: any } = {
        animationDur: 100,
        activecls: 'tab-active',
        fashion: 'xs:row',
        colsize: 'title:30%;body:70%',
        internal_fashion: 'row',
        fashion_style: {xs:'row'},
        column_size:{title:'30%', body:'70%'}
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
    _internal_fashion:string = this.DEFAULT_VALUES.internal_fashion;

    private _prev_ix:number;
    private _resizeListener = this._resizeEvent.bind(this);
    private _animation_styles:{[key:string]:string} = {};
    private _column_size:{[key:string]:string} =
                this.DEFAULT_VALUES.column_size;
    private _fashion_style:Array<ResponsiveVal> =
                this.DEFAULT_VALUES.fashion_style;

    constructor() {
        super();
    }
    override attributeChangedCallback(
                name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'animation') {
            if(animate_defs[new_val])
                this._animation_styles = {open: new_val, close: new_val}
            else {
                this._animation_styles = parseAttrVal(new_val);
                this._animation_styles = Object.assign({}, {
                    open:this._animation_styles?.show,
                    close:this._animation_styles?.hide});
            }
        } else if(name == 'fashion') {
            this._fashion_style = getResponsiveValues(
                new_val, this.DEFAULT_VALUES.fashion);
            let val = this._checkFashion();
            this._changeFashionStyle(val);
        } else if(name == "colsize")
            this._column_size = parseAttrVal(new_val);
    }
    override render() {
        if(this._internal_fashion == 'accordion') {
            return html`
<div id='accordion' @click=${this._titleClicked}>
    <slot name='acc'></slot>
</div>
            `
        } else {
            let fashionColumn:any = {
                display: 'grid',
                'grid-template-columns': `
                    ${this._column_size.title} ${this._column_size.body}`
            }
            return html`
${this._animateStyles()}
<div id="parent" class="parentDiv"
    style=${this._internal_fashion=='column'?
            styleMap(fashionColumn):''}>
    <div id="title-tab" style=
        "display:flex;
         flex-direction:${this._internal_fashion=='column'?
            'column':'row'}">
        <slot name="tab-title" @click=${this._titleClicked}>
        </slot>
    </div>
    <div id="body-tab">
        <slot id="body-slot" name="tab-body"></slot>
    </div>
</div>
            `
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", (e) => {
            this._slotChangedEvent(e)});
        window.addEventListener("resize", this._resizeListener);
    }
    override disconnectedCallback() {
        window.removeEventListener("resize", this._resizeListener);
    }
    override firstUpdated() {
        if(!this.animation)
            this.animationDur = 0;
        this._openActive();
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
        if(!this._prev_ix)
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
        if(this._internal_fashion != val) {
            if(val == 'accordion')
                this._showAccordion();
            else
                this._showRC();
            this._internal_fashion = val;
        }
    }
    private _resizeEvent() {
        let val = this._checkFashion();
        this._changeFashionStyle(val);
        this._openActive();
    }
    private _showAccordion() {
        if(this.animation) {
            let style = document.createElement("style");
            style.innerHTML = `${animationCSS(
                '.animation-open', '.animation-close',
                this._animation_styles, this.animationDur)}`
            this.appendChild(style);
        }
        let title = this.querySelectorAll("[slot=tab-title]");
        let body = this.querySelectorAll("[slot=tab-body]");
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
        for(let ix = 0;ix < title.length; ix++)
            if(title[ix] == e.target && this._prev_ix != ix)
                this.show(ix);
    }
    private _animateStyles() {
        if(!this.animation)
            return;
        return html`
<style>
    ${animationCSS(
        '::slotted(.animation-open)',
        '::slotted(.animation-close)',
        this._animation_styles,
        this.animationDur)}
</styel>`
    }
    private _show(ix:number, prev_ix:number) {
        let title = this.querySelectorAll("[slot=tab-title]");
        let body = this.querySelectorAll("[slot=tab-body]");
        if(prev_ix != null) {
            this.dispatchEvent(
                new CustomEvent("hide", { detail: { ix } })
            );
            if(this.animationDur) {
                body[prev_ix]?.classList.remove("animation-open");
                body[prev_ix]?.classList.add("animation-close");
            }
            if(body[prev_ix])
                (body[prev_ix] as HTMLElement).style.display = 'none';
            body[prev_ix]?.classList.remove(this.activecls)
            title[prev_ix]?.classList.remove(this.activecls);
        }
        this.dispatchEvent(
            new CustomEvent("show", { detail: { ix } })
        );
        title[ix]?.classList.add(this.activecls);
        body[ix]?.classList.add(this.activecls);
        if(this.animationDur) {
            body[ix]?.classList.remove("animation-close");
            body[ix]?.classList.add("animation-open");
        }
        if(body[ix])
            (body[ix] as HTMLElement).style.display = 'block';
    }
    show(ix:number) {
        this.dispatchEvent(
            new CustomEvent("change", { detail: { ix } })
        );
        if(this._prev_ix == ix && this._prev_ix != null)
            return
        let prev_ix = this._prev_ix;
        if(this.animationDur == 0)
            this._show(ix, prev_ix);
        else
            setTimeout( () => {this._show(ix, prev_ix)}, this.animationDur);
        if(this._prev_ix != ix)
            this._prev_ix = ix;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-tabs":AalamTabs;
    }
}
