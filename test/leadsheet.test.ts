import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { angie } from "./angieData.ts"
import { Parser } from "https://deno.land/x/parlexa/mod.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
import LeadSheet from "../LeadSheet.ts";
import { Templating } from "../Templating.ts";
import Vextab from "../Vextab.ts";
import align from "../align.ts";


// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }

// const sheet = Deno.readTextFileSync('./sheets/Angie.txt').replace(/\r/mg, '') 

/*
let errors = 0
for(let i = 0; i < angie.length ; i++) {
    if ( angie.charAt(i) !== sheet.charAt(i) ) {
        if ( errors++ < 10) console.log(`CHAR[${i}] mismatch: "${angie.charAt(i)}" !== "${sheet.charAt(i)}"`)
    }
}
// const decoder = new TextDecoder('utf-8');  <Keys<ParserTokens, LexerRules>>
// const angie = decoder.decode(Deno.readFileSync('./Angie.txt'))
*/
Deno.test({
    name: '01 - Parser is working on .ts Angie file', 
    fn: () => {  
        const parser = new Parser( LR, PR, 'reset')
        parser.debug = false
        parser.reset(angie)
        assert(parser.result.size > 0 )
        const tree = parser.getParseTree()
        assert(tree.length >  1000 )
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
        assert(tree.length > 1000 )
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
        const tp = new Templating('../templates', '.tmpl')
        const vextab = new Vextab(tree, tp)
        vextab.render()
        const html = vextab.getHtml()
        const encoder2 = new TextEncoder();
        const data2 = encoder2.encode( html );
        Deno.writeFile( './vextab.html',data2 )
        assert(html.length > 100 )
    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*
Deno.test({
    name: '05 - Leadsheet is reading the sheets and generating a main page', 
    fn: () => {  
        const ld = new LeadSheet( "../sheets", "../templates", '.txt')
        const html = ld.getMainPage('BornByTheRiver')
        assert(html.length > 100 )
        assert(ld.vexed.size > 0 )
        assert( ld.vexed.has('BornByTheRiver') )
        const vtml = ld.vexed.get('BornByTheRiver')!.getHtml()
        const encoder = new TextEncoder()
        const data = encoder.encode( vtml )
        Deno.writeFile( './vextab.html',data )
        //
        const encoder1 = new TextEncoder()
        const data1 = encoder1.encode( html )
        Deno.writeFile( './leadSheet.html',data1 )

    },
    sanitizeResources: false,
    sanitizeOps: false
})
*/ 
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