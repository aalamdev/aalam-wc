import {LitElement, html, css} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {query} from 'lit/decorators/query.js';
import {map} from 'lit/directives/map.js';

@customElement('aalam-scroller')
export class AalamScroller extends LitElement {
    @property()
    choices:string;

    @property()
    init:string;

    @state()
    _choices:string[];

    private observer:IntersectionObserver;
    private sel_el:HTMLElement;
    private divs:NodeListOf<HTMLDivElement>;

    @query('.child')
    child:HTMLElement;

    constructor() {
        super();
    }
    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'choices')
            this._choices = this.choices.split(",");
        else if (name == 'init') {
            if (this.divs)
                this._scrollToInit();
        }
    }
    override connectedCallback() {
        super.connectedCallback();
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        if (this.observer)
            this.observer.disconnect();
    }
    override render() {
        return html`
<div part="scroller-parent" class="parent">
    <div class="child">
        <div part="empty-el">&nbsp;</div>
        <div part="empty-el">&nbsp;</div>
        ${map(this._choices, (c) => html`
            <div part="scroller-el" class="scroller">${c}</div>`)}
        <div part="empty-el">&nbsp;</div>
        <div part="empty-el">&nbsp;</div>
    </div>
</div>`
    }
    static override get styles() {
        return css`
.scroller {line-height:18px;}
.parent {
    height: 150px;
    width:calc(100% - 5px);
    overflow:hidden;
    position:relative;
}
.child {
    text-align:center;
    width:100%;
    height:100%;
    overflow-y:scroll;
    scrollbar-width:none;
    box-sizing: content-box;
    scroll-snap-type: y mandatory;
    scroll-snap-points-y: repeat(16px);
    font-size:12px;
}
.child > div {
    transition: all 1s ease;
    opacity:0.6;
    line-height:18px;
    height:16px;
    scroll-snap-align:center;
    cursor:default;
}
.child:after {
    content:"";
    height:16px;
    position:absolute;top:50%;left:0;transform: translateY(-50%);
    right:0px;background:transparent;pointer-events:none;
}
.child > div.active {font-size:14px;opacity:1;}`
    }
    private _scrollToInit() {
        let ix = this._choices.indexOf(this.init);
        if (ix < 0) return;
        this.child.scrollTop = this.divs[ix].offsetTop;
    }
    override firstUpdated() {
        if(!this.child)
            return;

        if(this.observer)
            this.observer.disconnect();
        let options = {
            threshold: 0.9,
            root: this.child
        }
        this.observer = new IntersectionObserver(
            (entries) => this.callback(entries), options);
        this.divs = this.child.querySelectorAll("div");
        this.divs.forEach(target => {
            this.observer.observe(target);
        })
        if(this.init == null) return;
        this._scrollToInit();
    }
    isClose(n1:number, n2:number) {
        let diff = (n1 - n2);
        if (diff > -4 && diff < 4)
            return true;
        return false;
    }
    public callback(entries:IntersectionObserverEntry[]) {
        entries.forEach(entry => {
            if(!entry.isIntersecting) return;
            let crect = entry.rootBounds;
            let trect = entry.boundingClientRect;
            let val;
            let prev_sel = this.sel_el;
            if(crect) {
                if(this.isClose(trect.bottom, crect.bottom)) {
                    let prev = (entry.target.previousElementSibling)?.previousElementSibling as HTMLElement;
                    this.sel_el = prev;
                    if(prev)
                        val = prev.textContent;
                } else if (this.isClose(trect.top, crect.top)) {
                    let next = (entry.target.nextElementSibling)?.nextElementSibling as HTMLElement;
                    this.sel_el = next;
                    if(next)
                        val = next.textContent;
                }
            }
            if(val) this.dispatchEvent(new CustomEvent("change", {detail:{val}}));
            if(prev_sel) prev_sel.classList.remove('active');
            if(this.sel_el) this.sel_el.classList.add('active');
        })
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-scroller":AalamScroller;
    }
}
