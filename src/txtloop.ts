import {LitElement, html, css} from 'lit';
import {customElement, property, query,
        queryAssignedElements} from 'lit/decorators.js';

@customElement('aalam-txtloop')
export class AalamTxtloop extends LitElement {
    @property({type:Number, attribute:true})
    interval = 3;
    @property({type:String, attribute:true})
    showanimation = 'name:fade;dur:200';
    @property({type:String, attribute:true})
    hideanimation = 'name:fade;dur:200';

    @queryAssignedElements({slot: ''})
    _slotted_els:Array<HTMLElement>;

    @query('#container')
    _container_el:HTMLElement;

    private _timer:ReturnType<typeof setTimeout>|null = null;
    private _active_index:number;
    private show_animation_props:{name:string, duration:string}
    private hide_animation_props:{name:string, duration:string}

    static override get styles() {
        return css `
        :host {
            display:inline-block;
        }
        #container {
            position:relative;
            display:inline-block;
            white-space:nowrap;
            vertical-align:top;
            align-items:center;
        }
        ::slotted(*){
            display:none;
            position:absolute;
            top:0;
            left:0;
        }
        ::slotted(.show) {
            display:inline-block !important;
            animation: var(--show-animation-name)
            calc(var(--show-animation-dur) ) ease;
            transform-origin: var(--show-tr-origin);
        }
        ::slotted(.hide) {
            display:inline-block !important;
            animation: var(--hide-animation-name)
            calc(var(--hide-animation-dur) ) ease;
            transform-origin: var(--hide-tr-origin);
        }`;
    }

    override render() {
     return html`<span id="container"> <slot> </slot> </span>`;
    }

    getKeyFrames(name:string) {
        return {
            'show-fade': [{opacity: 0}, {opacity: 1}],
            'hide-fade': [{opacity: 1}, {opacity: 0}],
            'show-b2t': [{transform: "translate(0, 100%)", opacity: 0},
                         {transform: "translate(0, 0)", opacity: 1}],
            'hide-b2t': [{transform: "translate(0, 0)", opacity: 1},
                         {transform: "translate(0, -100%)", opacity: 0}],

            'show-t2b': [{ transform: "translate(0, -100%)", opacity: 0 },
                         { transform: "translate(0, 0)", opacity: 1 }],
            'hide-t2b': [{transform: "translate(0,0)", opacity:1},
                         { transform: "translate(0,100%)", opacity: 0}],

            'show-r2l': [{transform: "translate(100%,0)", opacity:0},
                        {transform: "translate(0,0)",opacity:1}],
            'hide-r2l': [{transform: "translate(0,0)", opacity:1},
                        {transform: "translate(-100%,0)", opacity:0}],

            'show-l2r': [{transform: "translate(-100%,0)", opacity:0},
                        {transform: "translate(0,0)",opacity:1}],
            'hide-l2r': [{transform: "translate(0,0)", opacity:1},
                        {transform: "translate(100%,0)", opacity:0}],

            'show-reveal-b2t': [{transform:"scaleY(0)",opacity:0},
                               {transform:"scaleY(1)", opacity:1}],
            'hide-reveal-b2t': [{transform:"scaleY(1)", opacity:1},
                               {transform:"scaleY(0)",opacity:0}],

            'show-reveal-t2b': [{transform:"scaleY(0)",opacity:0},
                               {transform:"scaleY(1)", opacity:1}],
            'hide-reveal-t2b': [{transform:"scaleY(1)", opacity:1},
                               {transform:"scaleY(0)",opacity:0}],

            'show-reveal-r2l': [{transform:"scaleX(0)",opacity:0},
                               {transform:"scaleX(1)", opacity:1}],
            'hide-reveal-r2l': [{transform:"scaleX(1)", opacity:1},
                               {transform:"scaleX(0)",opacity:0}],

            'show-reveal-l2r': [{transform:"scaleX(0)",opacity:0},
                               {transform:"scaleX(1)", opacity:1}],
            'hide-reveal-l2r': [{transform:"scaleX(1)", opacity:1},
                               {transform:"scaleX(0)",opacity:0}],

        }[name];
    }

    constructor() {
        super();
    }

    override connectedCallback(){
        super.connectedCallback();
        this.renderRoot.addEventListener("slotchange", () => {
            this.slotChangedEvent()});
        this.animationChange(this.showanimation,'show');
        this.animationChange(this.hideanimation,'hide');
    }

    override attributeChangedCallback(
        prop:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(prop,old_val,new_val);
            if (prop =='showanimation')
                this.animationChange(new_val,'show');
            else if (prop =='hideanimation')
                this.animationChange(new_val,'hide');
    }

    private animationChange(animationString: string, type: string) {
        const animationprops = this.procAnimationValue(animationString);
        const show_tr_origins:{[key:string]:string} = {
            'reveal-t2b': 'top',
            'reveal-b2t': 'bottom',
            'reveal-r2l': 'right',
            'reveal-l2r': 'left',
        };
        const hide_tr_origins:{[key:string]:string} = {
            'reveal-t2b': 'bottom',
            'reveal-b2t': 'top',
            'reveal-r2l': 'left',
            'reveal-l2r': 'right',
        };

        if (show_tr_origins[animationprops.name]) {
            this.style.setProperty(
                '--show-tr-origin', show_tr_origins[animationprops.name]);
            this.style.setProperty(
                '--hide-tr-origin', hide_tr_origins[animationprops.name]);
        }
        if (type == 'show') {
            this.show_animation_props = {
                name: `show-${animationprops.name}`,
                duration: `${animationprops.dur}ms`,
            };
        } else if (type == 'hide') {
            this.hide_animation_props = {
                name: `hide-${animationprops.name}`,
                duration: `${animationprops.dur}ms`,
            };
        }
        this.style.setProperty(
            `--${type}-animation-name`, `${type}-${animationprops.name}`);
        this.style.setProperty(
            `--${type}-animation-dur`, `${animationprops.dur}ms`);
    }

    private procAnimationValue(anim_str:string) {
        return anim_str
            .split(';')
            .map(part => part.split(':'))
            .reduce((acc, [key, value]) => {
                    if (key && value) {
                    acc[key.trim()] = value.trim();
                    }
                    return acc;
                    }, {} as { [key: string]: string });
    }

    private _showEl(el:HTMLElement) {
        el.classList.add("show")
        const ret = el.getBoundingClientRect();
        const keyframes = this.getKeyFrames(
            this.show_animation_props.name) as Keyframe[];
        const duration = parseInt(this.show_animation_props.duration);

        el.animate(keyframes, {duration}).finished.then(() => {
            let active_width = el.getBoundingClientRect().width;
            if (parseInt(this._container_el.style.width) > active_width){
                this._container_el.style.width = `${active_width}px`;
            }
        });
        return ret
    }

    private _hideEl(el:HTMLElement) {
        const keyframes = this.getKeyFrames(
            this.hide_animation_props.name) as Keyframe[];
        const duration = parseInt(this.hide_animation_props.duration);

        el.classList.add("hide")
        el.animate(keyframes,{duration}).finished.then(() => {
            el.classList.remove('hide');
        });
    }

    private slotChangedEvent() {
        let show_rect = this._showEl(this._slotted_els[0]);
        this._active_index = 0;
        if (this._timer) clearInterval(this._timer)
            this._timer = setInterval(() =>
            {this.switch()}, this.interval*1000);
        this.adjustcontainerwidth(0, show_rect);
    }

    private switch() {
        let nxt_index = (this._active_index + 1) % this._slotted_els.length;

        this.dispatchEvent(new CustomEvent("change",{
            detail:{
                showing:nxt_index,
                hiding: this._active_index 
            }
        }));

        let show_rect = this._showEl(this._slotted_els[nxt_index]);
        this.adjustcontainerwidth(this._active_index, show_rect);
        this._slotted_els[this._active_index].classList.remove('show');
        this._hideEl(this._slotted_els[this._active_index]);
        this._active_index = nxt_index;
    }

    private adjustcontainerwidth(hiding_ix:number, show_rect:DOMRect) {
        let hide_rect = this._slotted_els[hiding_ix].getBoundingClientRect()

        if(show_rect != null &&
                hide_rect != null &&
                this._container_el != null) {
            this._container_el.style.width = `${Math.max(
                show_rect.width, hide_rect.width)}px`;
            this._container_el.style.height = `${Math.max(
                show_rect.height, hide_rect.height)}px`;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-txtloop":AalamTxtloop;
    }
}
