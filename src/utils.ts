export const screen_size = ['xs', 's', 'm', 'l', 'xl'];
export const screen_limits:{[key:string]:Array<number|null>} = {
    'xs': [0,    640],
    's':  [640,  992],
    'm':  [992,  1200],
    'l':  [1200, 1600],
    'xl': [1600, null]
};
export interface ResponsiveVal {
    ll:number|null;
    ul:number|null;
    val:string;
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

export function getResponsiveValues(val_str:string, def_values:string|{[key:string]:string}, validator:Function):Array<ResponsiveVal> {
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
                ret.push({'ll': ll, 'ul': ul, 'val': val_obj[s]})
            else if (prev_ret?.['val'] == val_obj[s])
                prev_ret['ul'] = ul;
        } else if (prev_ret)
            prev_ret['ul'] = ul;
    }
    return ret;
}
