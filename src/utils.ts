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

export function parseAttrValue(val_str:string, validator?:Function):{[key:string]:string} {
    let val_obj:{[key:string]:string} = {};
    for (let spl of val_str.split(";")) {
        let [key, val] = spl.split(":").map(x => x.trim());
        if (!val)
            continue;
        if (!validator || validator(val))
            val_obj[key] = val;
    }
    return val_obj
}

export function getResponsiveValues(val_str:string, def_values:string|{[key:string]:string}, validator:Function):Array<ResponsiveVal> {
    let val_obj = parseAttrValue(val_str, validator)
    if (typeof def_values == 'string')
        def_values = parseAttrValue(def_values);

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
    for (let r of ret) {
        let {ll, ul} =  r;
        r['cond'] = `${ll != null?`(min-width:${ll}px)`:''}${ll != null && ul != null?' and ':''}${ul != null?`(max-width:${ul}px)`:''}`;
    }
    return ret;
}
