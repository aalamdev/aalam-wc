import { LitElement,html,css } from "lit";
import { customElement,property,state } from "lit/decorators.js";

@customElement("aalam-sgn-box")
export class AalamSuggestionBoxElement extends LitElement {
    constructor() {
        super();
        this.input.addEventListener("keydown",this.handlearrow.bind(this));
    }
    static styles = css`
    :host {
      display: grid;
      justify-content:center;
      align-items:center; 
      margin:50px;  
    }}`;

    @property()
    countheight:number = 0;

    @property()
    result:any[] = []

    @property()
    input:any = document.getElementById('inputbox');

    @state()
    minchar:any = this.input.getAttribute('minchar')

    @state()
    state:boolean = true;

    @property()
    currentindex:number = 0;

    @property()
    listkey:any = [];

    @property({type:Array, attribute: false})
    list : object[];

    @property({type:String, attribute:false})
    listKey:string;

    @state()
    loadmore_index:number = 0;

    render() {
      return html `
      <slot name="input" @input=${this.handleInput}></slot>
      <slot name="list-item" class="list-items">
      </slot>
      <ul>
        ${
          this.result.map((items,i) => {
            if(i<this.loadmore_index+5) {
              return html `
              <li @click=${this.fillInput} class="itemlist">${ ( typeof items === "object" ) ?  items.suggestion : items}</li>
             `
            }
            else if(i === this.loadmore_index+5 ) {
              return html `
              <li  @click=${this.appendsuggestion}>Load more...</li>
            ` 
            }
          }
        )
        }
      </ul>   `
    }
    handlearrow(e:KeyboardEvent){
     if(this.input.value.length >= this.minchar) {
      if (e.key === 'ArrowUp') {
        if(this.currentindex === 0) {
            this.currentindex = (this.loadmore_index+ 5 );
        }
        else {
            this.currentindex -= 1;
        }
        this.fillinputarrow(this.currentindex);
      }
      else if(e.key === "ArrowDown") {
          if(this.currentindex > this.result.length - 1) {
              this.currentindex = 0;
            }
            else {
              this.currentindex += 1;
            }
            this.fillinputarrow(this.currentindex);
        }
        else if(e.key === 'Enter') {
            e.preventDefault();
            if (this.currentindex == this.loadmore_index)
              this.appendsuggestion();
          }
      }
    }
    appendsuggestion() {
        this.loadmore_index += 5;
        this.currentindex = this.loadmore_index;
        this.countheight++;
    }
    handleInput(e:Event) {
        e.preventDefault();
        this.result = [];
        if(this.input.value.length >= this.minchar) {
            this.result = this.list.filter((key:any) => {
            this.state = true;
            for(let i = 0;i < this.input.value.length; i++) {
                if(typeof key === "object") { 
                    if(((key[this.listKey]).charAt(i).toLowerCase() != this.input.value.charAt(i).toLowerCase())) {
                        this.state = false;
                       }
                 }
                else if(key.charAt(i).toLowerCase() != this.input.value.charAt(i).toLowerCase()) {
                    this.state = false;
                 }
            }
            return this.state;
         })
       }
       if(this.input.value.length < 3) {
           this.loadmore_index = 0;
           this.currentindex = 0;
       }
    }
    fillInput(event:Event) {
        event.preventDefault()
        let temp = event.target as HTMLInputElement;
        if ( this.loadmore_index !== this.loadmore_index + 5 ) {
            this.input.value = temp.innerText;
         }
        else {
            this.appendsuggestion.bind(this);
        }
    }
    fillinputarrow(currentindex:number) {
        if( this.currentindex === this.loadmore_index + 5 + 1 ) {
            this.currentindex = this.currentindex -5 -1;
        }
        else if( this.currentindex !=( this.result.length ) % 5 - 4 ) {
            if( typeof this.result[ currentindex -1 ] === "object" ) {
                this.input.value = this.result[ currentindex - 1 ][ this.listKey ];
             }
            else if( typeof this.result[ currentindex-1 ] === "string" ) {
                this.input.value = this.result[ currentindex - 1 ];
             }
         }
       }
    }
