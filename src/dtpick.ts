import {LitElement, css, html} from 'lit';
import {when} from 'lit/directives/when.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';
import {customElement, property, state, query} from 'lit/decorators.js';

import {SortedArray} from "./utils";
import {AalamManagedInputElement} from "./minput";
import "./minput";

const NUM_DAYS_MS = 24 * 60 * 60 * 1000
const DATE_VIEW = 'd';
const MONTH_VIEW = 'm';
const YEAR_VIEW = 'y';
const YEARS_SPAN = 20;
const NUM_MONTH_IN_YR = 12;
const MIN_SUP_YEAR = 1900;
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const pad = (n:number):string => (n < 10?"0":"")  + n;
const _advMonths = (m:number, n:number) =>
    (m + n) % NUM_MONTH_IN_YR || NUM_MONTH_IN_YR;
const _advYrs = (m:number, y:number, n:number) =>
    Math.floor(y + (m - 1 + n)/NUM_MONTH_IN_YR);
const _redMonths = (m:number, p:number) =>
    NUM_MONTH_IN_YR + (
        (m - (NUM_MONTH_IN_YR + p)) % NUM_MONTH_IN_YR);
const _redYrs = (m:number, y:number, p:number) =>
    Math.floor(y + (m - 1 - p)/NUM_MONTH_IN_YR);

class ModelCalendar {
    month:number;
    year:number;
    first:Date;
    last:Date;
    gap_days:number;
    num_weeks:number;

    constructor(m:number, y:number) {
        this.month = m;
        this.year = y;
        this.first = new Date(y, m - 1, 1);
        this.last = new Date(y, m, 0);
        this.num_weeks = Math.ceil((this.last.getTime() - this.first.getTime()) / (7 * NUM_DAYS_MS)) +
                         (this.first.getDay() >= this.last.getDay()?1:0);
        this.gap_days = ModelCalendar.gap(this.first);
    }
    getMonth() {
        return MONTHS_SHORT[this.month - 1];
    }
    id() {
        return `${this.getMonth()}${this.year}`;
    }
    static gap(dt:Date|null) {
        if (!dt)
            return 0;
        dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
        return Math.round((dt.getTime() - new Date(0, 0, 0).getTime())/NUM_DAYS_MS);
    }
    html(cls_map:{[key:number|string]: any}) {
        let witer:number[][] = [];
        let dt = 1;
        const NUM_DAYS_IN_WEEK = 7;
        for (let i = 0; i < this.num_weeks; i++) {
            let days = []
            for (let j = 0; j < NUM_DAYS_IN_WEEK; j++) {
                if ((i == 0 && j < this.first.getDay()) ||
                    (i == (this.num_weeks - 1) &&  j > this.last.getDay())) {
                    days.push(0);
                    continue
                }
                days.push(dt)
                dt += 1;
            }
            witer.push(days);
        }
        let dis_fr = (cls_map['disFr'] as number) || 99;
        let dis_to = (cls_map['disTo'] as number) || 0;
        const checkDis = (day:number) => (day > dis_fr || day < dis_to)?'item-oor':'';

        return html`
${witer.map((week:number[]) =>
html`<div class="cal-week" part="cal-week"
    style="--gpweekstart:${this.gap_days + +week[0] - 1};--gpweekend:${this.gap_days + +week[week.length -1] - 1}">
    ${week.map(day => html`<div part="cal-day ${cls_map[day]?.part || ''} ${checkDis(day)}"
        class="__sel cal-day ${cls_map[day]?.cls || cls_map[day]?.part || ''} ${checkDis(day)}"
        style="--gpday:${day?(this.gap_days + day - 1):-1}"
        data-m=${this.month} data-y=${this.year} data-d=${day}>${day || ''}</div>`)}
</div>`
    )}
`
    }
}

class Calendars {
    private _map:{[key:string]:ModelCalendar};
    private _sorted_keys:SortedArray<string>;
    private _genkey = (m:number, y:number):string => `${m < 10?"0":""}${m}${y}`;

    constructor(_m?:{[key:string]:ModelCalendar}, _k?:SortedArray<string>) {
        this._map = _m || {};
        this._sorted_keys = _k || new SortedArray((a:string, b:string) => {
            let _a = this._map[a];
            let _b = this._map[b];
            return _a.year < _b.year ||
                   (_a.year == _b.year && _a.month < _b.month);
        });
    }
    remove(month:number, year:number):Calendars {
        let key = this._genkey(month, year);
        let ix = this._sorted_keys.indexOf(key);
        if (ix >= 0)
            this._sorted_keys.splice(ix, 1);
        delete this._map[key];
        return this;
    }
    add(month:number, year:number):Calendars {
        let key = this._genkey(month, year);
        if (key in this._map)
            return this;

        this._map[key] = new ModelCalendar(month, year);
        this._sorted_keys.insert(key);
        return this;
    }
    *[Symbol.iterator]() {
        for (let k of this._sorted_keys)
            yield this._map[k]
    }
    map(fn:Function) {
        for (let k of this._sorted_keys)
            fn(this._map[k]);
    }
    clone() {
        return new Calendars(this._map, this._sorted_keys);
    }
    get length() {
        return this._sorted_keys.length;
    }
    get(index:number|string) {
        if (typeof index == "number")
            return this._map[index >= 0?
                this._sorted_keys[index]:
                this._sorted_keys[this._sorted_keys.length + index]];
        else
            return this._map[index];
    }
    has(m:number, y:number):boolean {
         return this._sorted_keys.indexOf(this._genkey(m, y)) >= 0;
    }
}

@customElement('aalam-dtpick')
export class AalamDatePickerElement extends LitElement {
    @property({type: Boolean, attribute: true, reflect: true})
    range:boolean = false;

    @property({type: String, attribute: true})
    format:string;

    @property({type: String, attribute: true})
    maxval:string = '';

    @property({type: String, attribute: true})
    minval:string = '';

    @property({type: String, attribute: true})
    value:string = '';

    @query("#__nav", true)
    nav_el:HTMLElement;

    @query("#date1-dt")
    date1_el_dt:AalamManagedInputElement|null;
    @query("#date1-tm")
    date1_el_tm:AalamManagedInputElement|null;

    @query("#date2-dt")
    date2_el_dt:AalamManagedInputElement|null;
    @query("#date2-tm")
    date2_el_tm:AalamManagedInputElement|null;

    @query("#month-selector")
    month_sel_el:HTMLElement|null;

    @query("#year-selector")
    yr_sel_el:HTMLElement|null;

    @state()
    type:string = 'd';

    @state()
    private _min_dt:Date|null = null;

    @state()
    private _max_dt:Date|null = null;

    @state()
    private _calendars:Calendars;
    @state()
    private _months:SortedArray<number>|null;
    @state()
    private _years:SortedArray<number>|null;

    @state()
    private date1:Date|null;

    @state()
    private date2:Date|null;

    @state()
    private current_view:string = "d"; //d|m|y

    private _scrollLimitHits:{[key:string]:boolean} = {
        'top': false, 'btm': false};
    private _intr_observer:IntersectionObserver|null;
    private _mut_observer:MutationObserver;

    private _dec_fmt:{[key:string]: boolean} = {
        DD: true, MM: true, YYYY: true, hh: false, mm: false, ss: false};
    private _extension_det:{[key:string]:any}|null;
    private _update_scroll:string|null;
    private _viewObj = () => this.current_view == DATE_VIEW?this._calendars:(
        this.current_view == MONTH_VIEW)?this._months:this._years;
    private _resetLimits = () => {this._scrollLimitHits['top'] =
                                  this._scrollLimitHits['btm'] = false;}
    private _monthGap = (m:number, y:number):number => (y - 1) * 12 + m;
    private _yearGap = (y:number|undefined):number => y || 0;
    private _yrsBase = (y:number):number => y - (y % YEARS_SPAN)
    private _minputVal(d:Date|null, cls:string):string {
        if (!d)
            return '';

        if (this.type == 'd' || this.type == 't') {
            if (cls != 'tm')
                return `dt:${d && pad(d.getDate()) || ''};mon:${
                    d && pad(d.getMonth() + 1) || ''};yr:${
                    d && d.getFullYear() || ''}`
            else if (this.type == 't')
                return `hr:${d && pad((d.getHours() % 12) || 12) || ''};min:${
                d && pad(d.getMinutes()) || ''};sec:${
                d && pad(d.getSeconds()) || ''};mdn:${
                d && d.getHours() >= 12?'PM':'AM' || ''}`;
        } else if (this.type == 'm') {
            return `yr:${d && d.getFullYear()};mon:${d && pad(d.getMonth() + 1)}`;
        } else if (this.type == 'y') {
            return `yr:${d && d.getFullYear()}`
        }
        return '';
    }
    private _addCalendars(month:number, year:number, prev:number, next:number) {
        const _clamp = (inp:number[], bnd:string):number[] => {
            let ret = inp;
            if (bnd == 'min' && this._min_dt) {
                let d = this._diffMonths([this._min_dt.getMonth() + 1,
                                          this._min_dt.getFullYear()], inp);
                ret = d > 0?[this._min_dt.getMonth() + 1,
                             this._min_dt.getFullYear()]:inp;
                this._scrollLimitHits['top'] = d > 0;
            } else if (bnd == 'max' && this._max_dt) {
                let d = this._diffMonths(inp, [this._max_dt.getMonth() + 1,
                                               this._max_dt.getFullYear()])
                ret = d > 0?[this._max_dt.getMonth() + 1,
                             this._max_dt.getFullYear()]:inp;
                this._scrollLimitHits['btm'] = d > 0;
            }
            return ret;
        }
        this._resetLimits();
        let [pm, py] = _clamp([_redMonths(month, prev), _redYrs(month, year, prev)],
                              'min');
        let [nm, ny] = _clamp([_advMonths(month, next), _advYrs(month, year, next)],
                              'max');
        for (let y = py; y <= ny; y++) {
            for (let m = pm; m <= ((y == ny)?nm:NUM_MONTH_IN_YR); m++) {
                this._calendars.add(m, y);
            }
            pm = 1;
        }
        const NAV_MAX_CALENDARS = 24;  /*two years / 24 months*/
        this._scrollLimitHits['top'] = this._scrollLimitHits['top'] ||
            (this._calendars.length >= NAV_MAX_CALENDARS);
        this._scrollLimitHits['btm'] = this._scrollLimitHits['btm'] ||
            (this._calendars.length >= NAV_MAX_CALENDARS);
        return this._calendars.clone()
    }
    private _addMonths(ref_yr:number, prev:number, next:number):SortedArray<number> {
        if (!this._months)
            this._months = new SortedArray<number>;

        this._resetLimits();
        if (this._min_dt && this._min_dt.getFullYear() > (ref_yr - prev)) {
            prev = ref_yr - this._min_dt.getFullYear();
            this._scrollLimitHits['top'] = true;
        }
        if (this._max_dt && this._max_dt.getFullYear() < (ref_yr + next)) {
            next = this._max_dt.getFullYear() - ref_yr + 1;
            this._scrollLimitHits['btm'] = true;
        }
        for (let i = ref_yr - prev; i < ref_yr + next; i++)
            this._months.insert(i);

        const NAV_MAX_YEARS = 24;  /*two years / 24 months*/
        this._scrollLimitHits['top'] = this._scrollLimitHits['top'] ||
            (this._months.length >= NAV_MAX_YEARS);
        this._scrollLimitHits['btm'] = this._scrollLimitHits['btm'] ||
            (this._months.length >= NAV_MAX_YEARS);

        return this._months.clone()
    }
    private _addYears(ref_yr:number, prev:number, next:number):SortedArray<number> {
        if (!this._years)
            this._years = new SortedArray<number>;
        ref_yr = +ref_yr;
        let st_ref = this._yrsBase(ref_yr);
        this._resetLimits();
        if (this._min_dt &&
            this._yrsBase(this._min_dt.getFullYear()) >
            (st_ref - prev * YEARS_SPAN)) {
            prev =  (st_ref - this._yrsBase(
                this._min_dt.getFullYear())) / YEARS_SPAN;
            this._scrollLimitHits['top'] = true;
        }
        if (this._max_dt &&
            this._yrsBase(this._max_dt.getFullYear()) <
            (st_ref + next * YEARS_SPAN)) {
            next = (this._yrsBase(
                this._max_dt.getFullYear()) - st_ref)/YEARS_SPAN + 1;
            this._scrollLimitHits['btm'] = true;
        }
        for (let i = (st_ref - prev * YEARS_SPAN);
             i < (st_ref + next * YEARS_SPAN); i += YEARS_SPAN) {
            this._years.insert(i);
        }

        this._scrollLimitHits['top'] = this._scrollLimitHits['top'] ||
            (this._years[0] == MIN_SUP_YEAR);
        this._scrollLimitHits['btm'] = this._scrollLimitHits['btm'] ||
            (this._years[0] == MIN_SUP_YEAR);

        return this._years.clone()
    }
    private _calHtml(cal:ModelCalendar) {
        let now = new Date();
        let cls_map:{[key:string|number]:any} = {};
        let isSameMonth = (d:Date) => cal.month == (d.getMonth() + 1) &&
                                 cal.year == d.getFullYear();
        let addClsMap = (dt:number, val:string) => {
            if (!cls_map[dt])cls_map[dt] = {};
            cls_map[dt]['part'] = [cls_map[dt]['part'], val].join(" ")
            cls_map[dt]['class'] = [cls_map[dt]['class'], val].join(" ")
        }
        if (isSameMonth(now))
            addClsMap(now.getDate(), 'cal-today')
        if (this.date1 && isSameMonth(this.date1)) {
            addClsMap(this.date1.getDate(), 'cal-selected')
            addClsMap(this.date1.getDate(), 'cal-selected-from')
        }
        if (this.date2 && isSameMonth(this.date2)) {
            addClsMap(this.date2.getDate(), 'cal-selected');
            addClsMap(this.date2.getDate(), 'cal-selected-to')
        }
        if (this._min_dt && isSameMonth(this._min_dt))
            cls_map['disTo'] = this._min_dt.getDate();
        if (this._max_dt && isSameMonth(this._max_dt))
            cls_map['disFr'] = this._max_dt.getDate();
        return html`
<div id="${cal.id()}"
    part="cal-title" class="cal-title ${cal.first.getDay() > 3?'wide-first-week':''}"
          data-m=${cal.month} data-y=${cal.year}>
    <span part="cal-title-month" class="cal-title-month"
          data-m=${cal.month} data-y=${cal.year}
          @click=${this._monthTitleClickEvent}>${cal.getMonth()}</span>
    <span part="cal-title-year" class="cal-title-year"
          data-y=${cal.year} @click=${this._yearTitleClickEvent}>${cal.year}</span>
</div>
<div class="cal-month" @click=${this._calClickEvent}
     @mouseover=${(this.date1 && !this.date2)?this._mouseOverEvent:null}>
${cal.html(cls_map)}
</div>
`
    }
    private _extendCalendars(start:ModelCalendar, num:number) {
        this._calendars = this._addCalendars(
            start.month, start.year, num < 0?num*-1:0, num > 0?num:0);
    }
    private _breakMonthsHtml(cal:ModelCalendar, offset:number) {
        let fm, fy, tm, ty;
        if (offset < 0) {
            [fm, fy] = [_redMonths(cal.month, offset * -1),
                        _redYrs(cal.month, cal.year, offset * -1)];
            [tm, ty] = [cal.month, cal.year];
        } else if (offset > 0) {
            [tm, ty] = [_advMonths(cal.month, offset),
                        _advYrs(cal.month, cal.year, offset)];
            [fm, fy] = [cal.month != 12?cal.month + 1:1,
                        cal.month == 12?cal.year+1:cal.year];
        }
        if (!fm || !fy || !tm || !ty)
            return html``;

        return html`${MONTHS_SHORT[fm - 1]} ${fy} - ${MONTHS_SHORT[tm - 1]} ${ty}`;
    }
    private _calBreakHtml(prev:ModelCalendar, next:ModelCalendar, diffMonths:number) {
        let diff_yrs = Math.floor(diffMonths/NUM_MONTH_IN_YR);
        let diff_mnt = diffMonths - (diff_yrs * NUM_MONTH_IN_YR);
        let gpday = next.gap_days - 1;
        return html`<div part='break-block' class="break-block __sel"  style="--gpday:${gpday}">
<div part="break-block-desc" class="break-block-desc">
    ${diff_yrs?html`${diff_yrs} years`:''}
    ${diff_yrs && diff_mnt?html` &amp; <br/>`:''}
    ${diff_mnt?html`${diff_mnt} months`:''}
</div>
<div>
    <div part="cal-break-extender-bfr"
        class="ext-bfr ext-cal __sel"
        @click=${() => this._extendCalendars(prev, (diffMonths > 6?6:diff_mnt))}>
        ${this._breakMonthsHtml(prev, (diffMonths > 6?6:diff_mnt))}
    </div>
    ${when(diffMonths > 6, () => html`<div part="cal-break-extender-aft"
        class="ext-aft ext-cal __sel"
        @click=${() => this._extendCalendars(next, -6)}>
        ${this._breakMonthsHtml(next, -6)}
    </div>`)}
</div>
</div>
`
    }
    private _calsHtml() {
        let chtml = [];
        let prev = this._calendars.get(0);
        for (let c of this._calendars) {
            let diff = prev?this._diffMonths([c.month, c.year],
                                             [prev.month, prev.year]):0;
            if (diff > 1) {
                chtml.push(this._calBreakHtml(prev, c, diff));
            }
            chtml.push(this._calHtml(c))
            prev = c;
        }
        return chtml;
    }
    private _monthHtml(yr:number) {
        let now = new Date();
        let this_month = now.getFullYear() == +yr?(now.getMonth() + 1):null;
        let dis_to = (this._min_dt && this._min_dt.getFullYear() == yr)?
            this._min_dt.getMonth():0
        let dis_fr = (this._max_dt && this._max_dt.getFullYear() == yr)?
            this._max_dt.getMonth():99;
        let _isdis = (i:number) => (i < dis_to || i > dis_fr)?'item-oor':'';
        let _issel = (m:number) => (
            (this.date1?.getFullYear() == yr && this.date1?.getMonth() == m) ||
            (this.date2?.getFullYear() == yr && this.date2?.getMonth() == m))?'month-selected':'';

        return html`
<div part="month-title" id="m${yr}" class="month-title"
    data-y=${yr} @click=${this._yearTitleClickEvent}>${yr}</div>
<div class="grid-view" @click=${this._monthClickEvent} part="months-in-year">
    ${MONTHS_SHORT.map((m, i) => html`<span
        part="month-in-year ${(this_month == i + 1)?'month-this':''} ${_isdis(i)} ${_issel(i)}"
        class="__sel month-in-year ${(this_month == i + 1)?'month-this':''} ${_isdis(i)} ${_issel(i)}"
        @mouseover=${(this.date1 && !this.date2)?this._mouseOverEvent:null}
        style="--gpday:${this._monthGap(i+1, yr)}"
        data-y=${yr} data-m=${i + 1}>${m}</span>`)}
</div>
`
    }
    private _extendMonths(start:number, num:number) {
        this._months = this._addMonths(start, num < 0?num*-1:0, num > 0?num:0);
    }
    private _monthBreakHtml(prev:number, next:number, diff:number) {
        let gpday = this._monthGap(1, next) - 1;
        return html`<div part='break-block' class="break-block __sel"  style="--gpday:${gpday}">
<div part="break-block-desc" class="break-block-desc"
    data-y=${diff}>
    ${diff} years
</div>
<div>
    <div part="cal-break-extender-bfr"
        class="ext-bfr ext-mon __sel"
        @click=${() => this._extendMonths(prev, diff > 6?6:diff)}>
        ${prev} - ${prev + (diff > 6?6:diff)}
    </div>
    ${when(diff > 6, () => html`<div part="cal-break-extender-aft"
        class="ext-aft ext-mon __sel"
        @click=${() => this._extendMonths(next, -6)}>
        ${next - 6} - ${next}
    </div>`)}
</div>
</div>
`
    }
    private _monthsHtml() {
        let mhtml = [];
        let prev = 0;
        if (this._months) {
            for (let y of this._months) {
                let diff = prev?(y - prev):0;
                if (diff > 1)
                    mhtml.push(this._monthBreakHtml(prev, y, diff));
                mhtml.push(this._monthHtml(y));
                prev = y;
            }
        }
        return mhtml;
    }
    private _yearHtml(yr:number) {
        let this_year = new Date().getFullYear();
        let dis_to = (this._min_dt &&
                      this._min_dt.getFullYear() > yr &&
                      this._min_dt.getFullYear() <= (yr + YEARS_SPAN))?
                      this._min_dt.getFullYear():0
        let dis_fr = (this._max_dt && 
                      this._max_dt.getFullYear() >= yr &&
                      this._max_dt.getFullYear() < (yr + YEARS_SPAN))?
                      this._max_dt.getFullYear():9999;
        let _isdis = (i:number):string => (
            (yr + i) < dis_to || (yr + i) > dis_fr)?'item-oor':'';
        let _issel = (i:number):string => (
            this.date1?.getFullYear() == (yr + i) ||
            this.date2?.getFullYear() == (yr + i))?'year-selected':'';
        return html`
<div part="years-title" id=y${yr} class="years-title"
    data-sy=${yr}>${yr} - ${yr + YEARS_SPAN - 1}</div>
<div class="grid-view" @click=${this._yearClickEvent} part="years-range">
    ${map(range(YEARS_SPAN), (i) => html`<span
        part="year-in-years ${this_year == (yr + i)?'year-this':''} ${_isdis(i)} ${_issel(i)}"
        class="__sel year-in-years ${this_year == (yr + i)?'year-this':''} ${_isdis(i)} ${_issel(i)}"
        @mouseover=${(this.date1 && !this.date2)?this._mouseOverEvent:null}
        style="--gpday:${this._yearGap(yr + i)}"
        data-y=${yr + i}>${yr + i}</span>`)}
</div>
`
    }
    private _yearsHtml() {
        return this._years?.map(y => this._yearHtml(y));
    }
    private _intrObserverCallback(entries:IntersectionObserverEntry[]) {
        let vobj = this._viewObj();
        if (!vobj)
            return;
        entries.forEach(entry => {
            let cr = entry.boundingClientRect;
            let rr = entry.rootBounds;
            if (entry.target.id.startsWith('__scr_hldr_')) {
                if (!entry.isIntersecting)
                    return;
                let obj = entry.target.id == "__scr_hldr_top"?
                    vobj.get(0):vobj.get(-1);
                if (entry.target.id == '__scr_hldr_top')
                    this._extension_det = {'y': this.nav_el.scrollHeight};
                if (this.current_view == DATE_VIEW)
                    this._calendars = this._addCalendars(
                        (obj as ModelCalendar).month,
                        (obj as ModelCalendar).year,
                        entry.target.id == '__scr_hldr_top'?6:0,
                        entry.target.id == '__scr_hldr_btm'?6:0)
                else if (this.current_view == MONTH_VIEW)
                    this._months = this._addMonths(
                        obj as number,
                        entry.target.id == '__scr_hldr_top'?6:0,
                        entry.target.id == '__scr_hldr_btm'?6:0)
                else if (this.current_view == YEAR_VIEW) {
                    this._years = this._addYears(
                        obj as number,
                        entry.target.id == '__scr_hldr_top'?6:0,
                        entry.target.id == '__scr_hldr_btm'?6:0)
                }
            } else if (rr && 
                       (entry.target.classList.contains("cal-title") ||
                       entry.target.classList.contains("month-title"))) {
                let dset = (entry.target as HTMLElement).dataset;
                let [m, y] = [+(dset.m || 0), +(dset.y || 0)];
                if (entry.isIntersecting) {
                    let diff = Math.abs(rr.y - cr.y)
                    if (diff > 2*cr.height)
                        return;
                    if (entry.target.classList.contains("cal-title")) {
                        if (m == 1) {
                            m = 12;y -= 1;
                        } else
                            m -= 1;
                    }
                } else if (!entry.isIntersecting) {
                    let diff = Math.abs((cr.y + cr.height) - rr.y);
                    if (cr.y > rr.y || diff > cr.height)
                        return;
                }
                if (this.month_sel_el) {
                    this.month_sel_el.innerText = MONTHS_SHORT[m - 1];
                    this.month_sel_el.setAttribute("data-m", "" + m)
                    this.month_sel_el.setAttribute("data-y", "" + y)
                }
                if (this.yr_sel_el) {
                    this.yr_sel_el.innerText = "" + y;
                    this.yr_sel_el.setAttribute("data-y", "" + y)
                }
            }
        });
    }
    private _mutationObserverCallback(mlist:MutationRecord[]) {
        for (let record of mlist) {
            for (let node of record.addedNodes) {
                if ((node as Element).tagName != 'DIV')
                    continue;
                if ((node as Element).classList.contains("cal-title") ||
                    (node as Element).classList.contains("month-title") ||
                    (node as Element).classList.contains("years-title")) {
                    this._intr_observer?.observe(node as Element);
                }
            }
        }
    }
    private _scrollIntoView(el:HTMLElement) {
        if (!el) return;
        let r = el.getBoundingClientRect()
        let nr = this.nav_el.getBoundingClientRect();
        this.nav_el.scrollTop += r.y - nr.y;
    }
    private _diffMonths(a:number[], b:number[]) {
        return Math.round(((a[1] + (a[0] - 1)/NUM_MONTH_IN_YR) -
                           (b[1] + (b[0] - 1)/NUM_MONTH_IN_YR)) *
                          NUM_MONTH_IN_YR);
    }
    private _navigateToMonthView(yr:number) {
        this._refreshMonths(yr)
        this._addMonths(yr, 2, 2);
    }
    private _monthTitleClickEvent(event:PointerEvent) {
        let yr = (event.target as HTMLElement).dataset?.y;
        if (!yr)
            return;
        this._navigateToMonthView(+yr);
    }
    private _yearTitleClickEvent(event:PointerEvent) {
        let yr = (event.target as HTMLElement).dataset?.y;
        if (!yr)
            return;

        this._refreshYears(yr)
        this._addYears(+yr, 2, 2);
    }
    private _refreshCalendars(m:number, y:number) {
        this.current_view = DATE_VIEW;
        this._months = null;
        this._update_scroll = new ModelCalendar(m, y).id();
    }
    private _refreshMonths(yr:string|number) {
        this._months = new SortedArray;
        this.current_view = MONTH_VIEW;
        this._update_scroll = `m${yr}`;
    }
    private _refreshYears(yr:string|number) {
        this._years = new SortedArray;
        this.current_view = YEAR_VIEW;
        let st_ref = +yr - (+yr % YEARS_SPAN)
        this._update_scroll = `y${st_ref}`;
    }
    private _setDate(dt1:Date|null, dt2:Date|null) {
        if (dt1 != this.date1) {
            this.date1 = dt1;
            this.date1_el_dt?.setAttribute(
                "value", this._minputVal(this.date1, 'dt'));
            this.date1_el_tm?.setAttribute(
                "value", this._minputVal(this.date1, 'tm'));
        }
        if (dt2 != this.date2) {
            this.date2 = dt2;
            this.date2_el_dt?.setAttribute(
                "value", this._minputVal(this.date2, 'dt'));
            this.date2_el_tm?.setAttribute(
                "value", this._minputVal(this.date2, 'tm'));
        }
        let detail: {[key:string]:any};
        let fmt = this.format;
        let dobj = (d:Date):{[key:string]:string|Date} => {
            return {'date': new Date(d),
                    'value': AalamDatePickerElement.toStr(d, fmt)}}
        if (!this.range) {
            if (!this.date1)
                return;
            detail = dobj(this.date1);
            this.value = detail['value'];
        } else {
            if (!this.date1 || !this.date2) {
                this.value = `${
                    AalamDatePickerElement.toStr(this.date1, fmt)
                    || ''};${
                    AalamDatePickerElement.toStr(this.date2, fmt)
                    || ''}`
                return;
            }

            detail = {'from': dobj(this.date1), 'to': dobj(this.date2)}
            detail['value'] = `${detail['from']['value']};${detail['to']['value']}`;
            this.value = detail['value'];
        }
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            cancelable: true,
            detail: detail,
        }))
    }
    private _calClickEvent(event:PointerEvent) {
        let dtset = (event.target as HTMLElement).dataset;
        if (!dtset?.d)
            return;
        let sel_dt = new Date(+(dtset.y || 0),
                              +(dtset.m || 0) - 1,
                              +dtset.d);
        let setTime = (ref:AalamManagedInputElement|null, dh:number, dm:number, ds:number) => {
            let mdn = ref?.valdata?.mdn;
            let hr = ref?.valdata?.hr;
            if (hr != null && mdn != null) {
                if (mdn == 'PM')
                    hr = hr == 12?hr:(hr + 12);
                else if (mdn == 'AM')
                    hr = hr == 12?0:hr;
            }
            sel_dt.setHours(hr || dh);
            sel_dt.setMinutes(ref?.valdata?.min || dm);
            sel_dt.setSeconds(ref?.valdata?.sec || ds);
            if (this._max_dt && sel_dt > this._max_dt)
                sel_dt = new Date(this._max_dt);
            if (this._min_dt && sel_dt < this._min_dt)
                sel_dt = new Date(this._min_dt);
        }
        if (!this.range || !this.date1 ||
            (!this.date2 && sel_dt < this.date1) || this.date2) {
            if (this.type == 't')
                setTime(this.date1_el_tm, 0, 0, 0);
            this._setDate(sel_dt, null);
        } else {
            if (this.type == 't') 
                setTime(this.date2_el_tm, 23, 59, 59);
            this._setDate(this.date1, sel_dt);
        }
        let d1_gap = ModelCalendar.gap(this.date1),
            d2_gap = ModelCalendar.gap(this.date2);

        this.nav_el.style.setProperty("--gpfrom", "" + d1_gap);
        this.nav_el.style.setProperty("--gpto", "" + (d2_gap || 0));
        this.nav_el.style.setProperty("--gphovto", "0");
    }
    private _monthClickEvent(event:PointerEvent) {
        let dtset = (event.target as HTMLElement).dataset;
        if (!dtset?.m || !dtset?.y)
            return;
        let [m, y] = [+dtset.m,
                      +dtset.y];
        if (this.type == 'm') {
            let sel_dt = new Date(y, m - 1, 1);
            if (!this.range || !this.date1 ||
                (!this.date2 && sel_dt < this.date1) || this.date2) {
                this._setDate(sel_dt, null);
            } else {
                this._setDate(this.date1, sel_dt);
            }
            this.nav_el.style.setProperty(
                "--gpfrom",
                "" + (this.date1?this._monthGap(this.date1.getMonth() + 1,
                                                this.date1.getFullYear()):9999*12));
            this.nav_el.style.setProperty(
                "--gpto", "" + (this.date2?this._monthGap(
                    this.date2.getMonth() + 1, this.date2.getFullYear()):0));
            this.nav_el.style.setProperty("--gphovto", "0")
            return ;
        } else {
            let [f, l] = [this._calendars.get(0), this._calendars.get(-1)];
            let diff_f = this._diffMonths([m, y], [f.month, f.year]);
            let diff_l = this._diffMonths([m, y], [l.month, l.year]);

            this._refreshCalendars(m, y)
            if (diff_f >= 0 && diff_l <= 0 && this._calendars.has(m, y)) {
                /*Nohting to do here, as the calender view is fine already*/
                return;
            }

            /*If its just within 6 months gap from the top/bottom bounds, just add calendars*/
            if (diff_f >= -6 && diff_f < 0)
                this._calendars = this._addCalendars(f.month, f.year, 6, 0);
            else if (diff_l <= 6 && diff_l > 0)
                this._calendars = this._addCalendars(l.month, l.year, 0, 6);
            else {
                /*Make a collapsible view*/
                let six = diff_f < 0?0:3,
                    lix = this._calendars.length - (diff_f < 0?3:0);
                for (let i = lix - 1; i >= six; i--) {
                    let c = this._calendars.get(i);
                    this._calendars.remove(c.month, c.year);
                }
                this._addCalendars(m, y, 1, 1);
            }
        }
    }
    private _yearClickEvent(event:PointerEvent) {
        let dtset = (event.target as HTMLElement).dataset;
        if (!dtset?.y)
            return;
        let yr = +dtset.y
        if (this.type != 'y') {
            this._navigateToMonthView(yr);
            this._years = null;
            return;
        }
        let sel_dt = new Date(yr, 0, 1);
        if (!this.range || !this.date1 ||
            (!this.date2 && sel_dt < this.date1) || this.date2) {
            this._setDate(sel_dt, null);
        } else {
            this._setDate(this.date1, sel_dt);
        }
        this.nav_el.style.setProperty(
            "--gpfrom", "" + (this._yearGap(this.date1?.getFullYear()) || 9999))
        this.nav_el.style.setProperty(
            "--gpto", "" + this._yearGap(this.date2?.getFullYear()))
        this.nav_el.style.setProperty("--gphovto", "0")
    }
    private _mouseOverEvent(event:MouseEvent) {
        if (!this.range)
            return;
        let dtset = (event.target as HTMLElement).dataset
        if (!dtset)
            return;

        if (this.current_view == DATE_VIEW) {
            if (!dtset?.d)
                return
            let dt = new Date(+(dtset.y || 0),
                              +(dtset.m || 0) - 1,
                              +dtset.d);
            this.nav_el.style.setProperty(
                "--gphovto", "" + ModelCalendar.gap(dt));
        } else if (this.current_view == MONTH_VIEW) {
            if (!dtset.y || !dtset.m)
                return
            this.nav_el.style.setProperty(
                "--gphovto", "" + this._monthGap(
                    +dtset.m, +dtset.y));
        } else if (this.current_view == YEAR_VIEW) {
            if (!dtset.y)
                return
            this.nav_el.style.setProperty(
                "--gphovto", "" + this._yearGap(+dtset.y));
        }
    }
    private _minputChangedEvent(event:CustomEvent) {
        let id = (event.target as HTMLElement).id;
        let det = event.detail.all;
        let replacing = id.startsWith('date1')?this.date1:this.date2;
        let is_dt1 = id[4] == '1';
        let dt = null;
        if (id.endsWith("-dt")) {
            if (((this.type == 't' || this.type == 'd') &&
                 (!det['dt'] || !det['mon'] || !det['yr'])) ||
                (this.type == 'm' && (!det['mon'] || !det['yr'])) ||
                (this.type == 'y' && !det['yr'])) {
                return;
            }

            let tm_data = this.date1_el_tm?.valdata || {}
            dt = new Date(det['yr'], +(det['mon'] || 1) - 1, det['dt'] || 1,
                              tm_data['hr'] || (is_dt1?0:23),
                              tm_data['min'] || (is_dt1?0:59),
                              tm_data['sec'] || (is_dt1?0:59));
        } else if (id.endsWith("-tm")) {
            if (!replacing)
                return;
            let hr = +det['hr'];
            if (det['mdn'] == 'PM')
                hr = hr == 12?hr:(hr + 12);
            else if (det['mdn'] == 'AM')
                hr = hr == 12?0:hr;
            dt = new Date(replacing.getFullYear(), replacing.getMonth(),
                          replacing.getDate(),
                          hr || (is_dt1?0:23),
                          det['min'] || (is_dt1?0:59),
                          det['sec'] || (is_dt1?0:59));
        }
        let is_clamped = false
        if (dt && this._max_dt && dt > this._max_dt) {
            dt = new Date(this._max_dt);
            is_clamped = true;
        }
        if (dt && this._min_dt && dt < this._min_dt) {
            dt = new Date(this._min_dt);
            is_clamped = true;
        }
        if (is_clamped) {
            if (id.endsWith("-dt"))
                (event.target as HTMLElement).setAttribute(
                    'value', this._minputVal(dt, 'dt'));
            else {
                (event.target as HTMLElement).setAttribute(
                    'value', this._minputVal(dt, 'tm'));
            }
        }
        if (id.startsWith('date1')) {
            let d1:Date|null = dt;
            let d2:Date|null = this.date2;
            if (dt && this.date2 && dt > this.date2)
                d2 = null;
            this._setDate(d1, d2);
        } else {
            let d1:Date|null = this.date1;
            let d2:Date|null = dt;
            if (d1 && d2 && d2 < d1) {
                d1 = null;
            }
            this._setDate(d1, d2);
        }

        if (['dt', 'mon', 'yr'].indexOf(event.detail['changed']) < 0) {
            return;
        }

        let d1_gap, d2_gap;
        if (this.type == 'd' || this.type == 't') {
            d1_gap = ModelCalendar.gap(this.date1) || 10**8;
            d2_gap = ModelCalendar.gap(this.date2);
            this._calendars = new Calendars();
            let fnxt;
            if (this.range && this.date1 && this.date2 &&
                this.date1 < this.date2) {
                let months = this._diffMonths(
                    [this.date2.getMonth() + 1, this.date2.getFullYear()],
                    [this.date1.getMonth() + 1, this.date1.getFullYear()]);
                if (months <= 12)
                    fnxt = months;
            }
            if (this.date1)
                this._addCalendars(
                    this.date1.getMonth() + 1, this.date1.getFullYear(),
                    1, fnxt || 1);
            if (!fnxt && this.range && this.date2)
                this._addCalendars(
                    this.date2.getMonth() + 1, this.date2.getFullYear(), 1, 1);
            this._refreshCalendars(det['mon'], det['yr']);
        } else if (this.type == 'm') {
            /*TODO: refresh months view*/
            d1_gap = (this.date1 && this._monthGap(
                this.date1.getMonth() + 1, this.date1.getFullYear())) || 9999*12;
            d2_gap = (this.date2 && this._monthGap(
                this.date2.getMonth() + 1, this.date2.getFullYear())) || 0;
            let fnxt;
            if (this.range && this.date1 && this.date2 &&
                this.date1 < this.date2) {
                let months = d2_gap - d1_gap;
                if (months <= 12)
                    fnxt = months;
            }
            this._refreshMonths(det['yr']);
            if (this.date1)
                this._months = this._addMonths(
                    this.date1.getFullYear(), 2, fnxt || 2);
            if (!fnxt && this.range && this.date2)
                this._months = this._addMonths(
                    this.date2.getFullYear(), 2, 2);
        } else if (this.type == 'y') {
            /*TODO: refresh years view*/
            d1_gap = (this.date1 && this._yearGap(
                this.date1.getFullYear())) || 9999;
            d2_gap = (this.date2 && this._yearGap(
                this.date2.getFullYear())) || 0;
            let fnxt;
            if (this.range && this.date1 && this.date2 &&
                this.date1 < this.date2) {
                let years = this._yrsBase(this.date2.getFullYear()) -
                            this._yrsBase(this.date1.getFullYear());
                if (years <= 6*60)
                    fnxt = years;
            }
            this._refreshYears(det['yr']);
            if (this.date1)
                this._years = this._addYears(
                    this.date1.getFullYear(), 2, fnxt || 2);
            if (!fnxt && this.range && this.date2)
                this._years = this._addYears(this.date2.getFullYear(), 2, 2);
        }
        this.nav_el.style.setProperty("--gpfrom", "" + d1_gap)
        this.nav_el.style.setProperty("--gpto", "" + (d2_gap || 0))
        this.nav_el.style.setProperty('--gphovto', "0");
    }
    private _refreshView() {
        let now = this.date1 || new Date();
        if (this.type == 'd' || this.type == 't') {
            let dt = (this._max_dt && this._max_dt < now)?this._max_dt:now;
            this._refreshCalendars(dt.getMonth() + 1, dt.getFullYear())
            this._calendars = this._addCalendars(
                dt.getMonth() + 1, dt.getFullYear(), 1, 1)
        } else if (this.type == 'm' || this.type == 'y') {
            let dt = (this._max_dt && this._max_dt < now)?this._max_dt:now;
            if (this.type == 'm') {
                this._refreshMonths(dt.getFullYear());
                this._months = this._addMonths(dt.getFullYear() - 1, 2, 2)
            } else {
                this._refreshYears(dt.getFullYear());
                this._years = this._addYears(dt.getFullYear() - 1, 2, 2)
            }
        }
    }
    private _selectorHtml() {
        if (this.current_view == DATE_VIEW) {
            return html`<div class="nav-selector-holder" part="nav-selector-holder">
<span part="nav-selector nav-selector-month" class="nav-selector" id="month-selector" @click=${this._monthTitleClickEvent}></span>
<span part="nav-selector nav-selector-year" class="nav-selector" id="year-selector" @click=${this._yearTitleClickEvent}></span>
</div>`
        } else if (this.current_view == MONTH_VIEW) {
            return html`<div class="nav-selector-holder">
<span part="nav-selector nav-selector-year" class="nav-selector" id="year-selector" @click=${this._yearTitleClickEvent}></span>
</div>`
        }
        return html``;
    }
    private _inputHtml() {
        let dt_order:string[] = [];
        let tm_order:string[] = [];
        let ix:number = 0;
        let sep:{[key:string]:string} = {};
        while (ix < this.format.length) {
            let sel = '';
            if (this.format[ix] == 'Y') {
                sel = 'yr';
                ix += 4;
            } else if (this.format[ix] == 'M') {
                sel = 'mon';
                ix += 2;
            } else if (this.format[ix] == 'D') {
                sel = 'dt';
                ix += 2;
            } else if (this.format[ix] == 'h') {
                sel = 'hr';
                ix += 2;
            } else if (this.format[ix] == 'm') {
                sel = 'min';
                ix += 2;
            } else if (this.format[ix] == 's') {
                sel = 'sec';
                ix += 2;
            }
            while (ix < this.format.length &&
                   ['D', 'M', 'Y', 'h', 'm', 's'].indexOf(this.format[ix]) < 0) {
                sep[sel] = (sep[sel] || '') + this.format[ix];
                ix++;
            }
            if ((this.type == 'y' && sel != 'yr') ||
                (this.type == 'm' && sel != 'yr' && sel != 'mon') ||
                ((this.type == 'd' || this.type == 't') && sel != 'yr' && sel != 'mon' && sel != 'dt')) {
                if (this.type == 't' && (sel == 'hr' || sel == 'min' || sel == 'sec'))
                    tm_order.push(sel)
                continue;
            }

            dt_order.push(sel)
        }
        if (tm_order.indexOf("hr") >= 0)
            tm_order.push("mdn");

        let data_dt = `chars:2;nmin:1;nmax:31;type:n;ph:DD;${
                sep['dt']?('sepnxt:' + (sep['dt'] || '') + ';'):''
                }gapnxt:10px`;
        let data_mon = `chars:2;nmin:1;nmax:12;type:n;ph:MM;${
            sep['mon']?('sepnxt:' + (sep['mon'] || '') + ';'):''
            }gapnxt:10px`;
        let data_yr = `chars:4;type:n;ph:YYYY;${
            sep['dt']?('sepnxt:' + (sep['yr'] || '') + ';'):''
            }gapnxt:10px`;
        let data_hr = `chars:2;nmin:1;nmax:12;type:n;ph:hh;sepnxt::;gapnxt:10px;loop:1`;
        let data_min = `chars:2;nmin:0;nmax:59;type:n;ph:mm;sepnxt::;gapnxt:10px;loop:1`;
        let data_sec = `chars:2;nmin:0;nmax:59;type:n;ph:ss;loop:1`;
        let data_mdn = "type:text;choices:AM,PM";

        if (this._max_dt)
            data_yr += `;nmax:${this._max_dt.getFullYear()}`
        if (this._min_dt)
            data_yr += `;nmin:${this._min_dt.getFullYear() || MIN_SUP_YEAR}`
        let dt_html = (label:string, id:string, d:Date|null) => {
            return html`<div data-label="${label}"
    class="input-box" part="dt-input-box">
<aalam-minput order=${dt_order.join(",")} id=${id}
    @change=${this._minputChangedEvent}
    data-dt=${when(dt_order.indexOf('dt') >= 0, () => data_dt)}
    data-mon=${when(dt_order.indexOf('mon') >= 0, () => data_mon)}
    data-yr=${when(dt_order.indexOf('yr') >= 0, () => data_yr)}
    value=${this._minputVal(d, 'dt')}>
</aalam-minput></div>`
        }
        let tm_html = (id:string, d:Date|null) => {
            return html`<div part="tm-input-box" class="input-box" style="border:0">
<aalam-minput order=${tm_order.join(",")} id=${id}
    @change=${this._minputChangedEvent}
    data-hr=${when(tm_order.indexOf('hr') >= 0, () => data_hr)}
    data-min=${when(tm_order.indexOf('min') >= 0, () => data_min)}
    data-sec=${when(tm_order.indexOf('sec') >= 0, () => data_sec)}
    data-mdn=${when(tm_order.indexOf('hr') >= 0, () => data_mdn)}
    value=${this._minputVal(d, 'tm')}>
</aalam-minput></div>`
        }

        let _html = (label:string, id:string, d:Date|null) => {
            return html`
<div class="input-row">
    <div class="input-row-date">${dt_html(label, id + '-dt', d)}</div>
    ${when(this.type == 't',
           () => html`<div class="input-row-time">${
                tm_html(id + '-tm', d)}</div>`)}
</div>
`;
        }
        if (!this.range) {
            let label:{[key:string]:string} = {'t': 'Date & Time', 'd': 'Date', 'm': 'Month',
                         'y': 'Year'};
            return _html(label[this.type], 'date1', this.date1);
        } else {
            return [_html('From', 'date1', this.date1), _html('To', 'date2', this.date2)];
        }
    }
    private _validateFormat() {
        let dec:{[key:string]:boolean} = {
            MM:false, DD:false, YYYY:false, hh:false, mm:false, ss:false};
        for (let k of Object.keys(dec)) {
            if (this.format.indexOf(k) >= 0) {
                dec[k] = true;
            }
        }
        if (dec.hh)
            this.type = 't';
        else if (dec.DD)
            this.type = 'd';
        else if (dec.MM)
            this.type = 'm';
        else if (dec.YYYY)
            this.type = 'y';
        else {
            console.warn("Given format is not valid, setting to default");
            this.format = "DD/MM/YYYY";
            this.type = 'd';
            dec = {DD: true, MM: true, YYYY: true,
                   hh: false, mm: false, ss: false};
        }
        this._dec_fmt = dec;
        if (this.type == 't' || this._dec_fmt.hh) /*second condition just to fix typescript error*/
            this.current_view = DATE_VIEW;
        else
            this.current_view = this.type;
    }
    constructor() {
        super();
        this.format = "DD/MM/YYYY";
        this._calendars = new Calendars;
        this.current_view = DATE_VIEW;
    }
    override attributeChangedCallback(name:string, old_val:string, new_val:string) {
        super.attributeChangedCallback(name, old_val, new_val);
        if (name == 'minval') {
            if (this.type == 't' && new_val.indexOf('T') < 0)
                new_val += 'T00:00:00';
            this._min_dt = AalamDatePickerElement.fromStr(
                new_val, this.format);
            let d1 = this.date1,
                d2 = this.date2;
            if (d1 && this._min_dt && d1 < this._min_dt)
                d1 = null;
            if (d2 && this._min_dt && d2 < this._min_dt)
                d2 = null;
            this._setDate(d1, d2);
        } else if (name == 'maxval') {
            if (this.type == 't' && new_val.indexOf('T') < 0)
                new_val += 'T00:00:00';
            this._max_dt = AalamDatePickerElement.fromStr(
                new_val, this.format)
            let d1 = this.date1,
                d2 = this.date2;
            if (d1 && this._max_dt && d1 > this._max_dt)
                d1 = null;
            if (d2 && this._max_dt && d2 > this._max_dt)
                d2 = null;
            this._setDate(d1, d2);
        } else if (name == 'format') {
            this._validateFormat();
            if (!old_val)
                old_val = "DD/MM/YYYY";
        } else if (name == 'value') {
            let min = this.minval?AalamDatePickerElement.fromStr(
                this.minval, this.format):null;
            let max = this.maxval?AalamDatePickerElement.fromStr(
                this.maxval, this.format):null;
            let chk = (d:Date) => ((!min || d >= min) && (!max || d <= max));
            if (this.range) {
                let tmp = new_val.split(";");
                if (tmp.length != 2)
                    return;
                let [d1, d2] = [AalamDatePickerElement.fromStr(tmp[0], this.format),
                                AalamDatePickerElement.fromStr(tmp[1], this.format)];
                if ((tmp[0] && !d1) || (tmp[1] && !d2)) 
                    return
                if (d1 && !chk(d1))
                    d1 = null;
                if ((d2 && !chk(d2)) || (d1 && d2 && d1 > d2))
                    d2 = null;
                this._setDate(d1, d2);
           } else {
                let d = AalamDatePickerElement.fromStr(new_val, this.format);
                if (new_val && !d)
                    return;
                if (d && !chk(d))
                    d = null;
                this._setDate(d, null);
           }
        }
        if ((name == 'minval' || name == 'maxval' || name == 'value' || name == 'format') && old_val)
            this._refreshView();
    }
    override connectedCallback() {
        super.connectedCallback();
        this._mut_observer = new MutationObserver((mlist) => this._mutationObserverCallback(mlist));
        this._refreshView();
    }
    override disconnectedCallback() {
        if (this._intr_observer) {
            let scr_holders = this.nav_el.querySelectorAll(".scroll-holder")
            scr_holders.forEach(el => this._intr_observer?.unobserve(el));
            this._intr_observer.disconnect();
            this._intr_observer = null;

        }
        this._mut_observer.disconnect();
    }
    static override get styles() {
        return css`
@media (max-width:992px) {:host {--gridgap: 10px;}}
@media (min-width:992px) {:host {--gridgap: 15px;}}
#__container {height:100%;display:flex;flex-direction:column;}
#__nav {height: 100%;overflow:auto;}
.cal-month {display:table;width:100%;}
.cal-today::before {position:absolute;content: " ";border:1px solid #4E5A63;
top: 50%;left: 50%;height: 30px;width: 30px;border-radius: 6px;transform: translate(-50%, -50%);
}
.month-this,.year-this {border:1px solid #4E5A63;border-radius:6px;}
.cal-week {display:table-row;position-relative;height:36px;}
.cal-day {display:table-cell;width:calc(100% / 7);min-width:36px;text-align:center;
          vertical-align:middle;cursor:pointer;position:relative;}
.cal-day:not(.cal-selected):not(:empty):hover {background-color:#F2F5F8;}
.__sel {
--selinrange:calc(max(
    calc(0 - (
        max(var(--gpday),
        var(--gpfrom)) - min(
        var(--gpto),
        var(--gpday)))), -1) + 1);
--hovinrange:calc(max(
    calc(0 - (
        max(var(--gpday), var(--gpfrom)) - min(
        var(--gphovto), var(--gpday)))), -1) + 1);}
.cal-headcontainer {display:table;width:100%;padding-right:15px;box-sizing:border-box;}
.item-oor {pointer-events:none;opacity:0.5;}
.nav-selector-holder {padding:10px;border-bottom:1px solid #ddd;box-sizing:border-box;}
.nav-selector[data-m] {margin-right:10px;}
.nav-selector:not(:empty)::after {content: "\\25BC";font-size:0.8rem;margin-left:10px;}
.nav-selector {color:#1D6AB3;}
.cal-title {margin:10px;}
.cal-title.wide-first-week {margin-bottom:0;transform:translateY(100%);
                            position:relative;z-index:2;}
.scroll-holder {width:100%;height:50px;background:transparent}
.cal-selected, .year-selected, .month-selected {position:relative;color:white;}
.year-in-years,.month-in-year {position:relative;}
.cal-day::after, .year-in-years::after, .month-in-year::after {
    content: " ";position:absolute;
    left:0;right:0;top:50%;
    background:rgba(calc((229 * var(--selinrange)) + (242 * var(--hovinrange))),
                    calc((235 * var(--selinrange)) + (245 * var(--hovinrange))),
                    calc((241 * var(--selinrange)) + (248 * var(--hovinrange))),
                    calc(var(--selinrange) + var(--hovinrange)));
    z-index:-2;}
.cal-day::after {
    height: calc((var(--selinrange) + var(--hovinrange)) * 30px);transform:translate(0, -50%);}
.year-in-years::after, .month-in-year::after {
    top:0;height:100%;}
.month-title, .years-title {margin-top:20px;margin-bottom:10px;}
.grid-view {display:grid;
    grid-template-columns: calc(25% - var(--gridgap)) calc(25% - var(--gridgap)) calc(25% - var(--gridgap)) calc(25% - var(--gridgap));
    gap: var(--gridgap);align-items:center;text-align:center;}
.grid-view > * {padding:8px 0px;cursor:pointer;}
.cal-selected::before {position:absolute;top:50%;left:50%;width:30px;height:30px;
                      background:#253648;border-radius:6px;content:" ";
                      transform:translate(-50%, -50%);z-index:-1;}
.cal-selected-from::after {left:50%;}
.cal-selected-to::after {right:50%;}
.year-selected, .month-selected {background-color:#253648;}
.break-block {
    display:grid;
    margin:20px 0px;
    grid-template-columns: 33% 67%;
    background:rgba(calc((229 * var(--selinrange)) + (242 * var(--hovinrange))),
                    calc((235 * var(--selinrange)) + (245 * var(--hovinrange))),
                    calc((241 * var(--selinrange)) + (248 * var(--hovinrange))),
                    calc(var(--selinrange) + var(--hovinrange)));
}
.break-block-desc {border-right: 1px solid #ddd;display: flex;align-items: center;justify-content:center;
    text-align: center;}
.ext-bfr, .ext-aft {color:#1D6AB3;position:relative;padding:6px 14px;cursor:pointer}
.ext-aft {border-top: 1px solid #C9D6E2;}
.ext-bfr::after, .ext-aft::after {
    position:absolute;right:14px;top:50%;transform:translateY(-50%);}
.ext-bfr::after {content: "\\21A1";}
.ext-aft::after {content: "\\219F";}
.input-row {display:flex;}
.input-row-time {margin-left:auto;}
.input-box {
    border:1px solid #0F2234;padding:12px 12px;position:relative;
    width:fit-content;margin-bottom:20px;border-radius:4px;
}
.input-box::before {
    content: attr(data-label);position:absolute;top:0;left:10px;
    font-size:0.9rem;text-align:center;
    background:#fff;padding:0 6px;color:#0F2234;
    transform:translate(0, -50%);
}
`
    }
    override render() {
        let chdr = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return html`
<div id="__container">
    <div id="__header">
        ${this._inputHtml()}
        ${this._selectorHtml()}
        ${when(this.current_view == DATE_VIEW, () => html`
        <div class="cal-headcontainer">
            <div class="cal-week cal-weekhead">
                ${chdr.map(d => html`<div class="cal-dayhead cal-day"
                                          part="cal-dayhead">${d}</div>`)}
            </div>
        </div>`)}
    </div>
    <div id="__nav">
        <div id="__scr_hldr_top" class="scroll-holder"
             style="display:${this._scrollLimitHits['top']?"none":"block"}">
        </div>
        ${when(this.current_view == DATE_VIEW, () => this._calsHtml())}
        ${when(this.current_view == MONTH_VIEW, () => this._monthsHtml())}
        ${when(this.current_view == YEAR_VIEW, () => this._yearsHtml())}
        <div id="__scr_hldr_btm" class="scroll-holder"
             style="display:${this._scrollLimitHits['btm']?"none":"block"}">
        </div>
    </div>
</div>`
    }
    override firstUpdated() {
        this.nav_el.style.setProperty('--gpfrom', "0");
        this.nav_el.style.setProperty('--gpto', "0");
        this.nav_el.style.setProperty('--gphovto', "0");

        if (!this._intr_observer)  {
            this._intr_observer = new IntersectionObserver(
                (e) => {this._intrObserverCallback(e)}, {
                    root: this.nav_el,
                    threshold: 0.1
                })
            let scr_holders = this.nav_el.querySelectorAll(".scroll-holder")
            scr_holders.forEach(el => this._intr_observer?.observe(el));
        }
        this._mut_observer.observe(this.nav_el, {childList: true});
        let els!:NodeList;
        if (this.type == 'd' || this.type == 'm')
            els = this.nav_el.querySelectorAll(".cal-title");
        else if (this.type == 'm')
            els = this.nav_el.querySelectorAll(".month-title");
        else if (this.type == 'y')
            els = this.nav_el.querySelectorAll(".years-title");
        els?.forEach(el => this._intr_observer?.observe(<Element>el));
    }
    override updated() {
        if (this._update_scroll) {
            let el = <HTMLElement>this.nav_el.querySelector("#" + this._update_scroll)
            if (el)
                this._scrollIntoView(el);
            this._update_scroll = null;
            return;
        }
        if (!this._extension_det)
            return;
        let cur_y = this.nav_el.scrollHeight;
        this.nav_el.scrollTop = cur_y - this._extension_det['y'];
        this._extension_det = null;
    }
    public static fromStr(val:string, fmt:string):Date|null {
        fmt = fmt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let dt_match = new RegExp(fmt.replace(
            "DD", "(?<d>\\d{1,2})").replace(
            "MM", "(?<M>\\d{1,2})").replace(
            "YYYY", "(?<y>\\d\\d\\d\\d)").replace(
            'hh', "(?<h>\\d{1,2})").replace(
            "mm", "(?<m>\\d{1,2})").replace(
            "ss", "(?<s>\\d{1,2})")).exec(val)
        if (!dt_match)
            return null;

        let g = dt_match.groups;
        if (g)
            return new Date(+g['y'], (+g['M'] || 1) - 1, +g['d'] || 1,
                            +g['h'] || 0, +g['m'] || 0, +g['s'] || 0);
        return null
    }
    public static toStr(val:Date|null, fmt:string):string {
        if (!val)
            return ''
        return fmt.replace("DD", pad(val.getDate())).replace(
                           "MM", pad(val.getMonth() + 1)).replace(
                           "YYYY", "" + val.getFullYear()).replace(
                           "hh", pad(val.getHours())).replace(
                           "mm", pad(val.getMinutes())).replace(
                           "ss", pad(val.getSeconds()));
    }
}
