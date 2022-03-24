// @deno-types='https://deno.land/x/xregexp/types/index.d.ts'
import XRegExp from  'https://deno.land/x/xregexp/src/index.js'
import { ArgsObject } from "./interfaces.ts";

export const tmplFac = ( _tmpl: string, debug = true ): (a: ArgsObject )=>string => {
    const tmpl = _tmpl
    const vars = XRegExp.matchRecursive(tmpl, '§{', '}', 'g', { unbalanced: 'skip'})
    const argObj: ArgsObject = {}

    vars.forEach( (e: string)  => {
        argObj[e] = ''
    })

    if ( vars.length === 0 ) {
        return () => {
            return tmpl
        }
    }

    return ( a: ArgsObject ) => { 
        let tmplRes = tmpl
        if ( debug )  console.log(`tmplFac func got: ${JSON.stringify(a)}`)
        for ( const [name, value] of Object.entries(a) ) {
            if ( debug ) console.log(`tmplFac checks "${name}" against ${JSON.stringify(vars)}`)
            if ( vars.includes(name) )
                tmplRes = XRegExp.replace(tmplRes, `§\{${name}\}`, value, 'all')
            else 
                throw Error( `Unknown variable in parameter object: ${name}`)
        }
        // Check for missing variables
        if ( tmplRes.indexOf('§{') > 0 ) {
            const missing = XRegExp.matchRecursive(tmplRes, '§{', '}', 'g', { unbalanced: 'skip'})
            throw Error(`Missing variable(s) in parameter object: ${missing}`)
        }
        return tmplRes; 
    }
} 
