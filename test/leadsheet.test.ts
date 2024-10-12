import { assert, assertEquals, assertExists } from "https://deno.land/std/assert/mod.ts"
import { angie } from "./angieData.ts"
import { Parser } from "../imports.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
import * as path from "https://deno.land/std/path/mod.ts";

const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }
const _debug_hook = __dirname

Deno.test({
    name: '01 - Parser is working on .ts Angie file', 
    fn: () => {  
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = true
        parser.reset(angie)
        const tree = parser.getParseTree()
        const encoder = new TextEncoder();
        const data = encoder.encode( JSON.stringify(tree, undefined, 2) );
        Deno.writeFile( './data.json',data )
        const form = tree.filter( v => v.token === 'FORM') 
        assertEquals(form.length, 2)
        const sections = tree.filter( v => v.token === 'SECTION')
        assertEquals(sections.length, 5)

    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*

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
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = 'off'
        await LS.loadAllSheets()
        await LS.parseAllSheets()
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
    fn: async () => {  
        const LS = new LeadSheet( `${__dirname}\\..\\sheets`, '.txt')
        LS.debug = 'off'
        await LS.loadAllSheets()
        await LS.parseAllSheets()
        const sheet = await LS.getRestSheet('Angie')
        // Deno.writeTextFile('./log.txt',`${JSON.stringify(sheet, undefined, 2)}`, { append: true} )
        assertExists(sheet )
        assert(sheet.sections.length > 3 )
        // assert(sheet.chords.length > 0 )
        assert(sheet.sectionsCP.length > 0 )
        // Deno.writeTextFile('./log.txt',`${JSON.stringify(sheet, undefined, 2)}`, { append: false} )
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '07 - Vextab.transpose() function is working', 
    fn: async () => {  
         // Transposition: 
        const notesFlat  = [ "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A" ]
        const notesSharp = [ "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A" ]
        const LS = new LeadSheet( `${__dirname}\\..\\sheets`, '.txt')
        LS.debug = 'off'
        await LS.loadAllSheets()
        const sheet = await LS.getRestSheet('Angie', -1 , '#')
        let t1 = LS.currVextab!.transpose('A' ,0 ,'#' )
        assertEquals( t1, 'A')
        t1 = LS.currVextab!.transpose('Ab' ,0 ,'#' )
        assertEquals( t1, 'G#')
        t1 = LS.currVextab!.transpose('Ab' ,0 ,'b' )
        assertEquals( t1, 'Ab')
        t1 = LS.currVextab!.transpose('A' ,1 ,'#' )
        assertEquals( t1, 'A#')
        t1 = LS.currVextab!.transpose('A' ,-1 ,'b' )
        assertEquals( t1, 'Ab')

        for (let i = 0; i < 12 ; i++) {
            const noteB = 'A'
            const t1 = LS.currVextab!.transpose(noteB ,-i ,'#' )
            const t2 = notesSharp[12-i]
            // console.debug( `noteB = ${noteB}, t1: ${t1}, t2: ${t2}`)
            assertEquals( t1, t2)
            const noteS = 'F#'
            const t3 = LS.currVextab!.transpose(noteS ,i ,'b' )
            const t4  = notesFlat[9+i]
            // console.debug( `noteS = ${noteS}, t3: ${t3}, t4: ${t4}`)
            assertEquals( t3, t4)
        }
    },
    sanitizeResources: false,
    sanitizeOps: false
})
*/
/*
Deno.test({
    name: '08 - Vextab can transpose sheet', 
    fn: async () => {  
         // Transposition: 
        const notesFlat  = [ "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A" ]
        const notesSharp = [ "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A" ]
        const LS = new LeadSheet( `${__dirname}\\..\\sheets`, '.txt')
        LS.debug = 'off'
        await LS.loadAllSheets()
        const sheet = await LS.getRestSheet('Angie', 0 , '')
        let t1 = LS.currVextab!.transpose('A' ,0 ,'#' )
        assertEquals( t1, 'A')
        t1 = LS.currVextab!.transpose('A' ,0 ,'#' )
        assertEquals( t1, 'A#')
        t1 = LS.currVextab!.transpose('A' ,-1 ,'#' )
        assertEquals( t1, 'G#')
    },
    sanitizeResources: false,
    sanitizeOps: false
})
*/
