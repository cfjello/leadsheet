import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Parser } from "https://deno.land/x/parlexa/mod.ts";
// import { Parser } from "../../parlexa/mod.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
export interface PIndexable { [key: string]: any }

Deno.test({
    name: '01 - Parser can read Notes', 
    fn: () => {  
        const str = "f g c a"
        const parser = new Parser( LR, PR, 'note')
        parser.debug = false
        parser.reset(str)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        tree.forEach( e => {
            assert( e.type === 'NOTE_LOWER')
            assert( ['f', 'g', 'c', 'a'].includes(e.value as string))
        })
       
        assert( tree.length === 4 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '02 - Parser can read Minor Scales', 
    fn: () => {  
        const titleStr = "   F Melodic Minor            "
        const parser = new Parser( LR, PR, 'scaleMode')
        parser.debug = false
        parser.reset(titleStr)
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        assert( parser.result.size >= 5 )
        assert( tree.length === 3 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '03 - Parser can read All Scales', 
    fn: () => {  
        const titleStr = "   F  , G Major , C mixo"
        const parser = new Parser( LR, PR, 'scaleMode')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        assertEquals( tree.length, 7 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '04 - Parser can read Scale Directive', 
    fn: () => {  
        const titleStr = "S: C Dorian"
        const parser = new Parser( LR, PR, 'common')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.length, 3 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '05 - Parser can read Key Directive', 
    fn: () => {  
        const titleStr = "Key: C Harm. Minor"
        const parser = new Parser( LR, PR, 'common')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.length, 4 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '06 - Parser can read an inline Directive', 
    fn: () => {  
        const titleStr = "[ Key: C Harm. Minor]"
        const parser = new Parser( LR, PR, 'inline')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.length, 6 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '07 - Parser can read an inline Directive List', 
    fn: () => {  
        const titleStr = "[ Key: C Harm. Minor, S: C Dorian, Tempo: 240, M: 4/4 ]"
        const parser = new Parser( LR, PR, 'inline')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.length, 14 )
        assertEquals( tree.filter( v => v.type === 'TEMPO').length, 1 )
        assertEquals( tree.filter( v => v.type === 'METER').length, 1 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '08 - Parser can read an inline Text Notes', 
    fn: () => {  
        const titleStr = "[ @Per: Change strings, n: regularly ]"
        const parser = new Parser( LR, PR, 'inline')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.type !== 'Token')
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.length, 5 )
        assertEquals( tree.filter( v => v.type === 'TEXT_NOTE').length, 1 )
        assertEquals( tree.filter( v => v.type === 'TEXT_NOTE2').length, 1 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})
