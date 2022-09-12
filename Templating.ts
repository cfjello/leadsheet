// @deno-types='https://deno.land/x/xregexp/types/index.d.ts'
import XRegExp from  'https://deno.land/x/xregexp/src/index.js'
import { lodash as _ } from 'https://deno.land/x/deno_ts_lodash/mod.ts'
import { WalkEntryExt } from "./fileWalk.ts";
import { fileWalk } from "./fileWalk.ts";
import { ArgsObject, ArgsObjectArray } from "./interfaces.ts";

export const reserved = [
    '.', '¤¤_d_¤¤', 
    '+', '¤¤_p_¤¤', 
    '*', '¤¤_s_¤¤', 
    '?', '¤¤_q_¤¤',
    '^', '¤¤_h_¤¤' ,
    '$', '¤¤_u_¤¤',
    '(', '¤¤_l_¤¤',
    ')', '¤¤_r_¤¤',
    '[', '¤¤_b_¤¤',
    ']', '¤¤_e_¤¤',
    '|', '¤¤_o_¤¤'
    ]
const encoderMap = new Map<string, string>() // Initilized within the Templating class

export const encodeTmpl = ( tmpl: string ) => {
    let res = '' 
    for( const c of tmpl) {
        if ( encoderMap.has(c) ) 
            res += encoderMap.get(c)
        else
            res += c
    }
    return res
}

export const decodeTmpl = ( tmpl: string ) => {
    let res = '' 
    let i = 0 
    while( i < tmpl.length ) {
        if ( tmpl.substring( i, i < tmpl.length - 7 ? i+7: tmpl.length ).match(/^¤¤_(d|p|s|q|h|u|l|r|b|e|o)_¤¤/ ) ) {
            res += encoderMap.get( `¤¤_${tmpl[i+3]}_¤¤` )
            i += 7
        }
        else {
            res += tmpl[i++]
        }      
    }
    return res
}

export const tmplFac = ( _tmpl: string ): (a: ArgsObject ) => string => {
    const tmpl = _tmpl
    const vars = XRegExp.matchRecursive(tmpl, '§{', '}', 'g', { unbalanced: 'skip'})
    const argObj: ArgsObject = {}

    // Create a list of supplied replacement variable names
    vars.forEach( (e: string)  => {
        argObj[e] = ''
    })

    // special case: nothing to substitute
    if ( vars.length === 0 ) {
        return () => {
            return tmpl
        }
    }

    const renderTmpl = ( a: ArgsObject, resolveAll = true ): string => {
        let tmplRes = tmpl 
        let currName = ''
        try {
            for ( const [name, value] of Object.entries(a) ) {
                // console.log(`tmplFac checks "${name}"`)
                if ( vars.includes(name) ) {
                    currName = name
                    tmplRes = XRegExp.replace(tmplRes, `§{${name}}`, value, 'all')
                }
                else  
                    throw Error( `Unknown variable in parameter object: ${name}`)
            }
            // Check for missing variables
            if ( resolveAll ) {
                if ( tmplRes.indexOf('§{') > 0 ) {
                    const missing = XRegExp.matchRecursive(tmplRes, '§{', '}', 'g', { unbalanced: 'skip'})
                    throw Error(`Missing variable(s): [ ${missing}] in parameter object: ${JSON.stringify(a)}`)
                }
                tmplRes = decodeTmpl(tmplRes)
            }
        }
        catch( err ) {
            console.log(err)
            console.log(`Failed template: ${currName} => ${JSON.stringify(tmplRes)}`)
        }
        return tmplRes
    }

    // default case replacements
    return ( a: ArgsObject , resolveAll = true) => {
        if ( Array.isArray(a) ) {
            const res: string[] = []
            for ( const e of a ) {
                res.push(renderTmpl(e, resolveAll))
            }
            return res.join('\n')
        }
        else {
            return renderTmpl(a, resolveAll)
        }
    }
} 


export class Templating {
    debug = false
 
    tpls = new Map<string, any>()

    constructor( public dir = "./templates", public matchPattern = '.tmpl' ) {
        for ( let i = 0; i < reserved.length; i += 2 ) {
            encoderMap.set( reserved[i], reserved[i+1])
            encoderMap.set( reserved[i+1], reserved[i])
        }
        this.loadTemplates()
    }

    loadTemplates = () => {
        try {
            let entry: WalkEntryExt
            for (entry of fileWalk(this.dir, this.matchPattern)) {
                if ( entry.isFile && ! entry.isDirectory ) {
                    const _tmpl = Deno.readTextFileSync(entry.path).replace(/\r/mg, '') 
                    const tmpl  = encodeTmpl(_tmpl)
                    this.tpls.set(entry.baseName, tmplFac(tmpl))
                }
            }
        }
        catch( err ) { console.log(err) }
    }

    addTemplate = (name: string, _tmpl: string, overWrite = false) => {
        if ( ! this.tpls.has(name) || overWrite ) {
            const tmpl = encodeTmpl(_tmpl)
            this.tpls.set(name, tmplFac(tmpl))
        }
    }

    getTmpl = ( name: string, argsObj: ArgsObject | ArgsObjectArray , resolveAll = true ): string => {
        let res = ''
        try {
            if ( this.debug ) console.log('Render Template: ' + name)
            //
            // Fetch the named template function and 
            // call it with the arguments object
            //
            const func =  this.tpls.get(name) as (a: ArgsObject | ArgsObjectArray, resolveAll: boolean) => string
            res  = func(argsObj!, resolveAll) as string
        }
        catch(err) {
            console.log(err)
        }
        return res as string
    }
}