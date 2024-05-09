import { LitElement, html,css } from 'lit';
import { customElement ,property ,state } from 'lit/decorators.js';
import { queryAssignedElements } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
String.prototype.formatUnicorn =  function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
             Array.prototype.slice.call(arguments)
             : arguments[0];
             for (key in args) {
                 str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
             }
    }
    return str;
};
@customElement('aalam-sgn-box')
export class SuggestionBox extends LitElement {
  static styles = css`
`;
connectedCallback() {
  super.connectedCallback();
  this.addEventListener('mouseout', this._mouseOutEvent);
  document.addEventListener('click', this._outClickListener);
}
disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('mouseout', this._mouseOutEvent);
   document.addEventListener('click',this._outClickListener)
}
    @property()
    list:Object[];

    @property()
    listkey:string;

    @property()
    slot_input = null;

    @property()
    _private_slot_el:boolean = false;

    @property()
    _loadmore_item_el:boolean = false;

    @property()
    templatehtml:any;

    @queryAssignedElements({slot: 'sgn-item-template'})
    template_slots: Array<HTMLElement>;

    @queryAssignedElements({slot: '__private-item'})
    private_items: Array<HTMLElement>;

    @queryAssignedElements({slot: ' __loadmore-item'})
    loadmore_items: Array<HTMLElement>;

    @state()
    has_more:boolean;

    @state()
    index:number = -1;

    @property()
    size:number = 0;

    @state()
    show_empty:boolean = true;

    @state()
    result:Object[] = [];

    @property()
    highlight:string;

    @property()
    input_el:HTMLElement | null;

    @property()
    filtered_list : Object[];

    @property()
    prevIndex:any;

    @state()
    show_container = true;

    private _outClickListener = this.windowClickEvent.bind(this);

    private input_temp:HTMLElement | null;

    render() {
      console.log("rendering the component", this.show_container)
      return html `
      <div style = "position:relative" @click=${this._clickEvent}>
      <div part = "sgn-input" class = "inputbox" @keydown=${this.keyDownInputEvent}>
          <slot name = "sgn-input"  @input = ${this.unslottedInputEvent} @click=${this.inputfield}></slot>
      </div>
      <slot name = "sgn-item-template" style = "display:none"></slot>
      <div part = "sgn-container" style="display:${this.show_container?'block':'none'};" >
          <div style = "display:${this.show_empty?'block':'none'}" part = "sgn-empty"><slot name = "sgn-empty"></slot></div>
          <div  style = "display:${!this.show_empty ?'block':'none'}"  @mouseover=${this.mouseOverEvent} >
              <slot  name = "__private-item" @click = ${this.saveInputEvent} ></slot>
              <div part="sgn-loadmore" id="sgnload" class=${classMap({ 'active': this.has_more })} style="display: ${this.has_more ? 'block' : 'none'}" @click=${this.loadmoreentry}></div>
          </div>
       </div>
    </div>
      `
    }
    private _indexOfTarget(event) {
        let el = event.target;
        while (true) {
            if (el.slot == "__private-item")break;
            el = el.parentElement;
        }
    return this.private_items.indexOf(el);
    }
    saveInputEvent(event) {
        this.input_el.value =this.result[this._indexOfTarget(event)].name;
    }
    mouseOverEvent(e) {
        let curr_index = this._indexOfTarget(e);
        this.index=curr_index;
        this.setInputValue();
    }
    inputfield(event){
        this.index=-1;
    }
   private _clickEvent(event) {
       console.log("Event detail ", event.detail);
       event['__detail'] = '__sgn_box__';
    }
    private _mouseOutEvent() {
        if (this.prevIndex >= 0 && this.prevIndex < this.result.length) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove('active');
            }
        } else if (this.prevIndex === this.result.length) {
              this.loadmore_items[0].classList.remove('active');
          }
    }
    windowClickEvent(event) {
        console.log("Window click event ", event['__detail']);
        if (event['__detail'] === "__sgn_box__") {
            this.show_container=true;
            console.log("show_container true ", this.show_container)
        }
        else {
            this.show_container=false;
            console.log("show_container", this.show_container);
        }
   }
    keyDownInputEvent(e) {
        const resultLength = this.result.length;
        switch (e.key) {
            case "ArrowUp":
            this.index = (this.index === -1 || (this.has_more && this.index === 0)) ?
                       resultLength + (this.has_more ? 1 : 0) :
                       (this.index - 1 + resultLength + (this.has_more ? 1 : 0)) % (resultLength + (this.has_more ? 1 : 0));
            break;
            case "ArrowDown":
            this.index = (this.index === -1 || (this.has_more && this.index === resultLength)) ?
                       0 :
                       (this.index + 1) % (resultLength + (this.has_more ? 1 : 0));
            break;
            case "Enter":
            if (this.index === resultLength) {
                this.loadmoreentry();
            }
            break;
            default:
            if (this.list) {
                if(this.input_el.value){
                    this.filtered_list = this.list.filter((item) =>item[this.listkey].includes(this.input_el.value));
                    this.setSuggestion(this.filtered_list,"matched",false);
                }
                else {
                  this.filtered_list =[];
                  this.setSuggestion(this.filtered_list,"matched",false);
                }
            }
        }
        this.setInputValue();
    }
    unslottedInputEvent(e) {
        this.input_el= e.target;
        this.keyDownInputEvent(e);
        return;
    }
    setInputValue() {
        const resultLength = this.result.length;
        const selectedValue = this.result[this.index]?.name || "";
        if (this.prevIndex >= 0 && this.prevIndex < resultLength) {
            const prevItem = this.private_items[this.prevIndex];
            if (prevItem) {
                prevItem.classList.remove('active');
             }
        } else if (this.prevIndex === resultLength) {
              this.loadmore_items[0].classList.remove('active');
          }
          if (this.index >= 0 && this.index < resultLength) {
                const selectedItem = this.private_items[this.index];
                if (selectedItem) {
                    selectedItem.classList.add('active');
                }
          } else if (this.index === resultLength) {
                console.log("in loadmore")  
                this.loadmore_items[0].classList.add('active');
            }
            this.prevIndex = this.index;
            if (selectedValue) {
                this.input_el.value = selectedValue;
            }
        }
    setSuggestion(suggestions:Object[] , highlight?:string , has_more?:boolean) {
        this.result = [...suggestions];
        this.index = this.index;
        this.input_temp = this.input_el.value;
        this.input_temp? this.show_empty = false : this.show_empty = true;
        this.has_more = has_more;
        if(this._private_slot_el) {
            for (let el of this.private_items)
            el.remove();
        }
        this.size = suggestions.length;
        for (let i of suggestions) {
            let tmp = this.template_slots[0].innerHTML;
            let temp = tmp.formatUnicorn(i);
            let el = document.createElement("div");
            el.slot = "__private-item";
            el.innerHTML = temp;
            this.appendChild(el);
            this._private_slot_el = true;
        }
        if(this._loadmore_item_el) {
            for(let el of this.loadmore_items)
                el.remove();
        }
    }
    loadmoreentry() {
        const loadmore = new CustomEvent("loadmore",{
        bubbles:true,
      });
        this.dispatchEvent(loadmore);
    }
    appendSuggestion(suggestions:Object[], highlight:string, has_more:boolean) {
        this.result = [...this.result];
        this.result.push(suggestions);
        this.result = this.result.flat(Infinity)
        this.size = this.size + suggestions.length;
        this.has_more = has_more;
        if (!this.has_more && this.loadmore_items.length) {
            this.loadmore_items[0].remove();
        }
        for(let i of suggestions) {
            let tmp = this.template_slots[0].innerHTML;
            let temp=tmp.formatUnicorn(i);
            let el = document.createElement("div")
            el.slot = "__private-item";
            el.innerHTML = temp;
            this.appendChild(el);
        }
    }
}
