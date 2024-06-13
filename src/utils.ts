export const screen_size = ['xs', 's', 'm', 'l', 'xl'];
export const screen_limits:{[key:string]:Array<number|null>} = {
    'xs': [0,    641],
    's':  [641,  993],
    'm':  [993,  1201],
    'l':  [1201, 1601],
    'xl': [1601, null]
};
export interface ResponsiveVal {
    ll:number|null;
    ul:number|null;
    val:string;
    cond: string;
}

export function parseAttrVal(val:string, validator?:Function):{[key:string]:string} {
    let pos = 0;
    let val_obj:{[key:string]:string} = {};
    while (pos < val.length) {
        let col_ix = val.indexOf(":", pos);
        if (col_ix < 0)
            break
        let key = val.substr(pos, col_ix - pos)
        col_ix += 1;
        let sem_ix = val.indexOf(";", col_ix);
        if (sem_ix < 0)
            sem_ix = val.length;
        let res = val.substr(col_ix, sem_ix - col_ix).trim();
        if (!validator || validator(res))
            val_obj[key.trim()] = res;
        pos = sem_ix + 1;
    }
    return val_obj
}

export function getResponsiveValues(val_str:string, def_values:string|{[key:string]:string}, validator?:Function):Array<ResponsiveVal> {
    let val_obj = parseAttrVal(val_str, validator)
    if (typeof def_values == 'string')
        def_values = parseAttrVal(def_values);

    let ret:Array<ResponsiveVal> = [];
    for (let s of screen_size) {
        if (!val_obj[s])
            val_obj[s] = def_values[s];
        else
            break;
    }
    for (let s of screen_size) {
        let [ll, ul] = screen_limits[s]
        let prev_ret = ret.length?ret[ret.length - 1]:null;
        if (val_obj[s]) {
            if (!prev_ret || prev_ret['val'] != val_obj[s])
                ret.push({'ll': ll, 'ul': ul, 'val': val_obj[s], 'cond': ''})
            else if (prev_ret?.['val'] == val_obj[s])
                prev_ret['ul'] = ul;
        } else if (prev_ret)
            prev_ret['ul'] = ul;
    }
    for (let r of ret) {
        let {ll, ul} =  r;
        r['cond'] = `(min-width:${ll}px)${ll != null && ul != null?' and ':''}${ul != null?`(max-width:${ul}px)`:''}`;
    }
    return ret;
}

export class SortedArray<T> extends Array<T> {
    private _check:Function;

    constructor(comparefn?:Function) {
        super();
        this._check = comparefn || ((a:any, b:any) => a < b);
    }
    _sortedIndex(v:T) {
        var low = 0,
            high = this.length;

        while (low < high) {
            var mid = (low + high) >>> 1;
            if (this._check(this[mid], v)) low = mid + 1;
            else high = mid;
        }
        return low;
    }
    insert(v:T) {
        if (this.indexOf(v) >= 0)
            return;
        let ix = this._sortedIndex(v)
        this.splice(ix, 0, v);
    }
    get(index:number):T {
        return index >= 0?this[index]:this[this.length + index];
    }
    clone():SortedArray<T> {
        let ret = new SortedArray<T>(this._check);
        for (let i of this)
            ret.push(i);
        return ret;
    }
}
