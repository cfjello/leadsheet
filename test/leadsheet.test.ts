import { assert, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { LeadSheet } from "../LeadSheet.ts"
import { align } from "../align.ts"
import { angie } from "./angieData.ts"
import { Parser } from "https://deno.land/x/parlexa/mod.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
import * as path from "https://deno.land/std/path/mod.ts";

const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }
const debug_hook = __dirname

Deno.test({
    name: '01 - Parser is working on .ts Angie file', 
    fn: () => {  
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(angie)
        assert(parser.result.size > 0 )
        const tree = parser.getParseTree()
        assert(tree.length >  800 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '02 - Parser is working on .txt Angie file', 
    fn: () => {  
        const sheet = Deno.readTextFileSync('../sheets/Angie.txt').replace(/\r/mg, '') 
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(sheet.toString())
        assert(parser.result.size > 0 )
        const tree = parser.getParseTree()
        assert(tree.length > 800 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '03 - Parser is working on .txt BornByTheRiver file', 
    fn: () => {  
        const sheet = Deno.readTextFileSync('../sheets/BornByTheRiver.txt').replace(/\r/mg, '') 
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(sheet.toString())
        assert(parser.result.size > 0 )
        const tree = parser.getParseTree()
        assert(tree.length > 500 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '04 - Vextab is working on .txt Angie file', 
    fn: () => {  
        const sheet = Deno.readTextFileSync('../sheets/Angie.txt').replace(/\r/mg, '') 
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(sheet.toString())
        assert(parser.result.size > 0 )
        const tree = parser.getParseTree()
        align(tree)
        const encoder = new TextEncoder();
        const data = encoder.encode( JSON.stringify(tree, undefined, 2) );
        Deno.writeFile( './data.json',data )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '05 - Leadsheet can read the parseTree', 
    fn: () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = false
        LS.loadAllSheets()
        LS.parseAllSheets()
        const pTree = LS.parsed.get('Default')
        assert(pTree.length > 100 )
        const vTree = LS.vexed.get('Default')
        Deno.writeTextFile('./log.txt',`${JSON.stringify(vTree, undefined, 2)}`, { append: false} )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '06 - Leadsheet is reading the sheets sheet Structure', 
    fn: () => {  
        const LS = new LeadSheet( `${__dirname}\\..\\sheets`, '.txt')
        LS.debug = false
        LS.loadAllSheets()
        LS.parseAllSheets()
        const sheet = LS.getRestSheet('Angie')
        Deno.writeTextFile('./log.txt',`${JSON.stringify(sheet, undefined, 2)}`, { append: true} )
        assertExists(sheet )
        assert(sheet.sections.length > 3 )
        assert(sheet.chords.length > 0 )
        assert(sheet.sectionsCP.length > 0 )
        // Deno.writeTextFile('./log.txt',`${JSON.stringify(sheet, undefined, 2)}`, { append: false} )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*
Deno.test({
    name: '01 - Parser can read a header Title and Auther', 
    fn: () => {  
        const titleStr = "     Title: Angie\nAuthor: Rolling Stones\n"
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(titleStr)
        console.log ( `01 result size: ${parser.result.size}`)
        assertEquals( parser.result.size, 15 )
        const tree = parser.getParseTree()
        assertEquals( parser.result.size, 15 )
        console.log ( `01 tree length: ${tree.length}`)

        parser.debug = true
        parser.reset(titleStr)
        console.log ( `01 result size: ${parser.result.size}`)
        const tree2 = parser.getParseTree()
        console.log ( `01 tree length: ${tree2.length}`)
        assertEquals(parser.result.size, 21 )
        // assert(parser.debug || tree.length === 11, `Parser match tree num of elements  ${tree.length} <> 11`)
    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*
Deno.test({
    name: '01 - Parser can fail base on missing TITLE in header', 
    fn: () => {  
        const titleStr = "     \nAuthor: Rolling Stones\n"
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(titleStr)
        console.log ( `01 result size: ${parser.result.size}`)
        assertEquals( parser.result.size, 15 )
        const tree = parser.getParseTree()
        assertEquals( parser.result.size, 15 )
        console.log ( `01 tree length: ${tree.length}`)
        // console.log(`${JSON.stringify(tree, undefined, 2)}`)

        parser.debug = true
        parser.reset(titleStr)
        console.log ( `01 result size: ${parser.result.size}`)
        const tree2 = parser.getParseTree()
        console.log ( `01 tree length: ${tree2.length}`)
        assertEquals(parser.result.size, 21 )
        // assert(parser.debug || tree.length === 11, `Parser match tree num of elements  ${tree.length} <> 11`)
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '02 - Parser can read a Form directive', 
    fn: () => {  
        const titleStr = "\nForm:  \n  - Intro \n- Verse\n  - Verse 2\n  - Intro\n  - Verse 3\n  - Coda\n"
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = true
        parser.reset(titleStr)
        console.log ( `02 result size: ${parser.result.size}`)
        // assert( parser.result.size > 10 , 'Missing entries in parser.result')
        const tree = parser.getParseTree()
        console.log ( `02 tree length: ${tree.length}`)

        assertEquals(parser.result.size, 38)
        assertEquals(tree.length, 26)
    },
    sanitizeResources: false,
    sanitizeOps: false
})

 
Deno.test({
    name: '01 - Parser can read the complete sheet', 
    fn: () => {  
        console.log(`${JSON.stringify(tree, undefined, 2)}`)
        /*
        const parsed = tree[Symbol.iterator]()
        const check  = checkData[Symbol.iterator]() 
        let p = parsed.next()
        let c = check.next()

        while ( ! p.done ) {  
            for ( const prop in c.value ) {
                if ( prop ==='id' || prop === 'children' || prop ==='parent') continue
                console.log(`${JSON.stringify(c)}`)
                assertEquals(
                    c.value[prop], (p.value as PIndexable)[prop],
                    `REC: ${JSON.stringify(c, undefined, 2)}\nProperty: ${prop}: ${c.value[prop]} <> ${(p.value as PIndexable)[prop]}`
                )
            }
            p = parsed.next()
            c = check.next()
        } 

    },
    sanitizeResources: false,
    sanitizeOps: false
})

*/