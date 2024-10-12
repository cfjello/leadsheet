import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
// import { Parser } from "https://deno.land/x/parlexa/mod.ts";
import { Parser } from "../../parlexa/mod.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }


Deno.test({
    name: '01 - Parser can read a Header', 
    fn: () => {  
        const str = "\nTitle: Angie\nAuthor: Jagger/Richards\nTempo: 120\nKey: C Major\nMeter: 4/4\n"
        const parser = new Parser( LR, PR, 'header')
        parser.debug = false
        parser.reset(str)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree()
       
        const title = tree.filter( v => v.token === 'TITLE')
        assertEquals(title.length, 1)
        assertEquals(title[0].value, 'Angie')
        const author = tree.filter( v => v.token === 'AUTHOR')
        assertEquals(author.length, 1)
        assertEquals(author[0].value, 'Jagger/Richards')
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '02 - Parser can read a Form List', 
    fn: () => {  
        const titleStr = "\n Form: Intro, Verse 1,    Verse 2, Coda        \n"
        const parser = new Parser( LR, PR, 'header')
        parser.debug = false
        parser.reset(titleStr)
        const res = parser.getParseTree().filter( v => v.token == 'LIST_ENTRY')
        assertEquals( res.length, 4)
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '03 - Parser can read a Section', 
    fn: () => {  
        const titleStr = "  \n  \n Section:                                 \n"
        const parser = new Parser( LR, PR, 'section')
        parser.debug = false
        parser.reset(titleStr)
        assert( parser.result.size >= 5 )
        const tree = parser.getParseTree().filter( v => v.token === 'SECTION_HEAD')
        assertEquals( tree.length, 1 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '03 - Parser can read a Section with inline commands', 
    fn: () => {  
        const titleStr = "    \n Section    [Tempo: 220,  Meter: 3/4]:                                 \n"
        const parser = new Parser( LR, PR, 'section')
        parser.debug = false
        parser.reset(titleStr)
        const tree = parser.getParseTree()
        // Deno.writeTextFileSync('testResults.json', JSON.stringify(tree, undefined, 2))
        const colon = tree.filter( v => v.token === 'COLON')
        assertEquals( colon.length, 1 )
        const section = tree.filter( v => v.token === 'SECTION_HEAD')
        assertEquals( section.length, 1 )
        const tempo = tree.filter( v => v.token === 'TEMPO')
        assertEquals( tempo.length, 1 )
        const meter = tree.filter( v => v.token === 'METER')
        assertEquals( meter.length, 1 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '04 - Parser can read a Bar Line', 
    fn: () => {  
        const titleStr = " | Dm7 G7 | Cmaj7 |"  
        const parser = new Parser( LR, PR, 'barLine')
        parser.debug = true
        parser.reset(titleStr)
        const tree = parser.getParseTree()
        // Deno.writeTextFileSync('testResults.json', JSON.stringify(tree, undefined, 2))
        const res = tree.filter( v => v.token === 'barEntry')
        assertEquals( res.length, 3 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


/*
Deno.test({
    name: '03 - Parser can read a Section head followed by a Bar Line', 
    fn: () => {  
        const titleStr = "    \n Section    [Tempo: 220,  Meter: 3/4]:      | Dm7 G7 | Cmaj7 |                            \n"
        const parser = new Parser( LR, PR, 'section')
        parser.debug = false
        parser.reset(titleStr)
        const tree = parser.getParseTree()
        // Deno.writeTextFileSync('testResults.json', JSON.stringify(tree, undefined, 2))
        const section = tree.filter( v => v.token === 'sectionExt')
        assertEquals( section.length, 1 )
        const barLine = tree.filter( v => v.token === 'barLine')
        assertEquals( barLine.length, 3 ) 
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '03 - Parser can read a Lyrics Text Item', 
    fn: () => {  
        const titleStr = "   \n _ textline with preceding underscore.                       \n"
        const parser = new Parser( LR, PR, 'textLine')
        parser.debug = false
        parser.reset(titleStr)
        const tree = parser.getParseTree()
        // Deno.writeTextFileSync('testResults.json', JSON.stringify(tree, undefined, 2))
        const textItem = tree.filter( v => v.token === 'TEXT')
        assertEquals( textItem.length, 1 ) 
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '04 - Parser can read a Text lines', 
    fn: () => {  
        const titleStr = "    \n _ This is my _ text line with _ multiple underscores.                       \n"
        const parser = new Parser( LR, PR, 'textLine')
        parser.debug = false
        parser.reset(titleStr)
        const tree = parser.getParseTree()
        // Deno.writeTextFileSync('testResults.json', JSON.stringify(tree, undefined, 2))
        const section = tree.filter( v => v.token === 'textItem')
        assertEquals( section.length, 3 )
        const textItem = tree.filter( v => v.token === 'TEXT')
        assertEquals( textItem.length, 3 ) 
    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*
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
        assertEquals( tree.filter( v => v.type === 'KEY').length, 1 )
        assertEquals( tree.filter( v => v.type === 'SCALE').length, 1 )
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
*/