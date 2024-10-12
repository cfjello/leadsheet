import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
// import { Parser } from "https://deno.land/x/parlexa/mod.ts";
import { Parser } from "../imports.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }

Deno.test({
    name: '01 - Parser can read Notes', 
    fn: () => {  
        const str = "f g c a"
        const parser = new Parser( LR, PR, 'note')
        parser.debug = false
        parser.reset(str)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.token === 'NOTE_LOWER')
        tree.forEach( e => {
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
        const tree = parser.getParseTree()
        const note = tree.filter( v => v.token === 'NOTE_BOTH')
        assertEquals( note.length, 1)
        assertEquals( note[0].value, 'F')
        const mode = tree.filter( v => v.token === 'MINOR_MOD')
        assertEquals( mode.length, 1)
        assertEquals( mode[0].value, 'Melodic')
        const minor = tree.filter( v => v.token === 'MINOR')
        assertEquals( minor.length, 1)
        assertEquals( minor[0].value, 'Minor')
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '03 - Parser can read multiple Scales', 
    fn: () => {  
        const titleStr = "   F  , G Major , C mixo"
        const parser = new Parser( LR, PR, 'scaleMode')
        parser.debug = false
        parser.reset(titleStr)
        // assert( parser.result.size >= 5 )
        const tree = parser.getParseTree()
        const note = tree.filter( v => v.token === 'NOTE_BOTH')
        assertEquals( note.length, 3)
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
        const tree = parser.getParseTree()
        const keyWord = tree.filter( v => v.token === 'SCALE')
        assertEquals( keyWord.length, 1)
        assertEquals( keyWord[0].value, 'S:')
        const note = tree.filter( v => v.token === 'NOTE_BOTH')
        assertEquals( note.length, 1)
        const mode = tree.filter( v => v.token === 'MODE')
        assertEquals( mode.length, 1)
        // console.log(JSON.stringify(tree, undefined, 2))
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '05 - Parser can read Key Directive', 
    fn: () => {  
        const titleStr = "Key: C Harm. Minor"
        const parser = new Parser( LR, PR, 'keyCmd')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree()
        const keyWord = tree.filter( v => v.token === 'KEY')
        assertEquals( keyWord.length, 1)
        assertEquals( keyWord[0]['keyWord'], 'Key')
        const note = tree.filter( v => v.token === 'NOTE_BOTH')
        assertEquals( note.length, 1)
        assertEquals( note[0].value, 'C')
        const mode = tree.filter( v => v.token === 'MINOR_MOD')
        assertEquals( mode.length, 1)
        assertEquals( mode[0].value, 'Harm')
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
        const tree = parser.getParseTree()
        const inline = tree.filter( v => v.token === 'inline')
        assertEquals( inline.length, 1 )
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
        const tree = parser.getParseTree()
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.filter( v => v.token === 'KEY').length, 1 )
        assertEquals( tree.filter( v => v.token === 'SCALE').length, 1 )
        assertEquals( tree.filter( v => v.token === 'TEMPO').length, 1 )
        assertEquals( tree.filter( v => v.token === 'METER').length, 1 )
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
        const tree = parser.getParseTree()
        // console.log(JSON.stringify(tree, undefined, 2))
        assertEquals( tree.filter( v => v.token === 'TEXT_NOTE').length, 1 )
        assertEquals( tree.filter( v => v.token === 'TEXT_NOTE2').length, 1 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})
