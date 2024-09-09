import {LitElement, html, css} from "lit";
import {property, query} from "lit/decorators.js";
import "./dropdown";

export class AalamNavMenu extends LitElement {
    @property({ type: String })
    direction = "last";

    @query('[slot=dd-body]')
    _dd_body:HTMLElement;

    @query('[slot=dd-toggler]')
    _dd_toggler:HTMLElement;

    @query('#_container')
    _container:HTMLElement;

    private _sorted_menu:HTMLElement[] = [];
    private _slot_order_list:number[] = [];
    private _slot_dirty_changes = false;
    private _sorted_dd:HTMLElement[] = [];
    private _tgl_width:number;
    private _resizeListener = this._manageCollapsedItems.bind(this);

    constructor() {
        super();
    }
    override attributeChangedCallback(
        name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if(name == 'direction') {
            if(new_val != 'first' && new_val != 'last')
                this.direction = 'last';
        }
    }
    override connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this._resizeListener);
        this.renderRoot.addEventListener('slotchange', (e) => {
            this._slotChangedEvent(e)});
    }
    override disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("resize", this._resizeListener);
    }
    override render() {
        return html`
<div id='_container' part='menu-container'>
    <slot name='menu-item'></slot>
    <aalam-dropdown>
        <div slot='dd-toggler'>
            <slot name='toggle-item'></slot>
        </div>
        <div slot='dd-body' part='dd-body'>
            <slot name="__collapsed_item"></slot>
        </div>
    </aalam-dropdown>
</div>`
    }
    static override get styles() {
        return css`
:host {display:flex;width:100%;}
#_container {display:inline-flex}`
    }
    private _slotChangedEvent(e:Event) {
        let name = (e.target as HTMLSlotElement)?.name;
        if(name == '__collapsed_item') return;
        else if (name == 'toggle-item') {
            let dpd = this.renderRoot.querySelector("aalam-dropdown");
            let dd = this.querySelector('[slot=toggle-item]');
            if(!dpd || !dd) return;
            dpd.updateComplete.then(() => {
                this._tgl_width =  dd.getBoundingClientRect().width;
                this._dd_toggler.style.display = 'none';
                this._manageCollapsedItems();
            });
        }
        if(this._slot_dirty_changes) {
            this._slot_dirty_changes = false;
            return;
        }
        if(name == 'menu-item') {
            let el:HTMLElement[] = Array.from(
                this.querySelectorAll('[slot=menu-item]'));
            el.forEach((e) => {
                let e_width = e.getBoundingClientRect().width;
                this._slot_order_list.push(e_width);
            });
            this._sorted_menu = el.sort(
                (a:HTMLElement, b:HTMLElement) => {
                let a_priority = parseInt(
                    a.getAttribute('data-priority') || '0', 0);
                let b_priority = parseInt(
                    b.getAttribute('data-priority') || '0', 0);
                if(a_priority === b_priority) {
                    if(this.direction == 'last')
                        return el.indexOf(b) - el.indexOf(a);
                    else if(this.direction == 'first')
                        return el.indexOf(a) - el.indexOf(b);
                }
                return a_priority - b_priority;
            });
        }
    }
    private _manageCollapsedItems() {
        const dd_len = () => {return this._sorted_dd.length};
        const c_width = () => {
            return this._container.getBoundingClientRect().width};
        const par_width = () => {
            return this.parentElement?.clientWidth || this.clientWidth };
        const change_slot_name = (el:HTMLElement, _slot:string) => {
            this._slot_dirty_changes = true;
            el.slot = _slot;
        }
        const add_el_width = () => {
            let ix = Array.prototype.indexOf.call(
                this.children,
                this._sorted_dd[dd_len() - 1]);
            return this._slot_order_list[ix];
        }
        let parent_width = par_width();
        let cont_width = c_width();
        if(parent_width <= cont_width) {
            this._dd_toggler.style.display = 'block';
            if(this._sorted_menu.length < 1) return;
            while(parent_width <= cont_width) {
                change_slot_name(this._sorted_menu[0], '__collapsed_item');
                this._sorted_dd.push(this._sorted_menu[0]);
                this._sorted_menu.splice(0, 1);
                if(this._sorted_menu.length < 1) return;
                cont_width = c_width();
            }
        } else if(parent_width >= cont_width) {
            let d_len = dd_len();
            if(d_len < 1) {
                this._dd_toggler.style.display = 'none';
                return;
            }
            if(d_len == 1)
                parent_width = par_width() + this._tgl_width;
            while(parent_width >= cont_width + add_el_width()) {
                if(d_len == 1)
                    this._dd_toggler.style.display = 'none';
                change_slot_name(this._sorted_dd[dd_len() - 1], 'menu-item');
                this._sorted_menu.splice(0, 0, this._sorted_dd[d_len - 1]);
                this._sorted_dd.splice(d_len - 1, 1);
                d_len = dd_len();
                if(d_len < 1) return;
                cont_width = c_width();
                if(d_len == 1)
                    parent_width += this._tgl_width;
            }
        }
    }
}

customElements.define("aalam-navmenu", AalamNavMenu)
