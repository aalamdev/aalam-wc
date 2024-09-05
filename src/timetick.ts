import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('aalam-timetick')
export class AalamTimetick extends LitElement {
    @property({type:String, attribute:true})
    elapseat ='';

    private _my_interval:ReturnType<typeof setInterval>|null = null;
    private _elapsed_date:Date;
    private _year_el:HTMLElement | null;
    private _month_el:HTMLElement | null;
    private _week_el:HTMLElement | null;
    private _day_el:HTMLElement | null;
    private _hour_el:HTMLElement | null;
    private _min_el:HTMLElement | null;
    private _sec_el:HTMLElement | null;

    static override get styles() {
        return css `
:host {
    display:inline-block;
}`;
    }

    override render() {
        return html`
<div>
    <slot name='tt-tick'> </slot>
    <slot name='tt-elapsed'> </slot>
</div>`;
    }

    constructor() {
        super();
    }

    override connectedCallback() {
        super.connectedCallback();
        this.elementHolder();
        this.startTimer();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
        this.clearTimer();
    }

    override attributeChangedCallback(name:string, old:string, val:string) {
        super.attributeChangedCallback(name, old, val);
        if (this.elapseat) {
            this._elapsed_date = new Date(val);
            if (old)
                this.startTimer();
        }
    }

    private clearTimer() {
        if (this._my_interval) {
            clearInterval(this._my_interval);
            this._my_interval = null;
        }
    }

    private elementHolder() {
        this._year_el = this.querySelector('[data-timetick=year]');
        this._month_el = this.querySelector('[data-timetick=month]');
        this._week_el = this.querySelector('[data-timetick=week]');
        this._day_el = this.querySelector('[data-timetick=day]');
        this._hour_el = this.querySelector('[data-timetick=hour]');
        this._min_el = this.querySelector('[data-timetick=min]');
        this._sec_el = this.querySelector('[data-timetick=sec]');
    }

    private startTimer() {
        this.clearTimer();
        this.hideMsg();
        this.timeCount();
        this._my_interval = setInterval(() => this.timeCount(), 1000);
    }

    private timeCount() {
        let now = new Date();
        let remaining_time = this._elapsed_date.valueOf() - now.valueOf();

        if (remaining_time <= 0) {
            this.clearTimer();
            this.elapsed();
            return;
        }

        let pad = (x:number) => (x < 10)?`0${x}`:x;
        const variables = ['Seconds', 'Minutes', 'Hours',
                           'Date', 'Month', 'Year'];
        const var_limits = [60, 60, 24, new Date(now.getFullYear(),
                            now.getMonth() + 1, 0).getDate(), 12,-1];
        let components = Array(6);

        for (let ix = 0; ix < variables.length; ix++) {
            let get = (x:any) => x[`get${variables[ix]}`]()
            let diff = (components[ix] || 0) +  get(this._elapsed_date) - get(now);
                if (diff < 0) {
                    diff += var_limits[ix];
                    components[ix + 1] = -1;
                }
                components[ix] = diff;
        }

        if (!this._year_el) {
            components[4] = components[4] + (components[5] * 12);
            components[5] = 0;
        } else {
            this._year_el.innerText = `${pad(components[5])}`;
        }

        if (!this._month_el) {
            if (this._year_el && components[5] > 0) {
                now = new Date(now.getFullYear() + components[5], now.getMonth(),
                               now.getDate(), now.getHours(), now.getMinutes(),
                               now.getSeconds());
            }
            components[3] = Math.floor((this._elapsed_date.getTime() 
                                        - now.getTime())/(1000 * 24 * 3600));
        } else {
            this._month_el.innerText = `${pad(components[4])}`;
        }

        if (this._week_el) {
            let weeks = Math.floor(components[3] / 7);
            components[3] = components[3] %  7;
            this._week_el.innerText = `${pad(weeks)}`;
        }

        if (!this._day_el) {
            components[2] = components[2] + (components[3] * 24);
        } else {
            this._day_el.innerText = `${pad(components[3])}`;
        }

        if (!this._hour_el) {
            components[1] = components[1] + (components[2] * 60);
        } else {
            this._hour_el.innerText = `${pad(components[2])}`;
        }

        if (!this._min_el) {
            components[0] = components[0] + (components[1] * 60);
        } else {
            this._min_el.innerText = `${pad(components[1])}`;
        }

        if (this._sec_el) {
            this._sec_el.innerText = `${pad(components[0])}`;
        }

        this.dispatchEvent(new CustomEvent("tick", {
            detail:{
                year:this._year_el,
                month:this._month_el,
                week:this._week_el,
                day:this._day_el,
                hour:this._hour_el,
                min:this._min_el,
                sec:this._sec_el
            }
        }));

    }

    private elapsed() {
        let el = this.querySelectorAll('[data-timetick]');
        el.forEach( (v)  => { (v as HTMLElement).innerText = '00' });
        this.dispatchEvent(new CustomEvent("elapsed"));

        const show_el = this.querySelector('[data-msg=msg]') as HTMLElement;
        if(show_el)
            show_el.style.display="block";
    }

    private hideMsg() {
        const hide_el = this.querySelector('[data-msg=msg]') as HTMLElement;
        if(hide_el)
            hide_el.style.display="none";
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "aalam-timetick":AalamTimetick;
    }
}
