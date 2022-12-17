import { assert, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { LeadSheet } from "../LeadSheet.ts"
import { align } from "../align.ts"
import { angie } from "./angieData.ts"
import { Parser } from "https://deno.land/x/parlexa/mod.ts"
// import { Parser } from "../../parlexa/mod.ts"
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
        const sheet = Deno.readTextFileSync(`../sheets/I'm a Mover.txt`).replace(/\r/mg, '') 
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

/*
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
        // const vTree = LS.vexed.get('Default')
        // Deno.writeTextFile('./log.txt',`${JSON.stringify(vTree, undefined, 2)}`, { append: false} )
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
*/