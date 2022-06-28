import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Parser } from "https://deno.land/x/parlexa/mod.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
import LeadSheetPetite from "../LeadSheetPetite.ts";
import { ArgsObject } from "../interfaces.ts"


// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }


// Initialize main page

// const encoderHtml = new TextEncoder();
// const dataHtml = encoderHtml.encode( leadSheet.getMainPage().replaceAll('__@__', '$'));
// Deno.writeFileSync( './html/leadsheet.html' ,dataHtml )

const LS = new LeadSheetPetite()
LS.loadAllSheets()
LS.parseAllSheets()
LS.renderVextab('Angie')

Deno.test({
    name: '04 - LeadSheet has loaded the files', 
    fn: () => {  
        const menuList: ArgsObject[] = LS.getMenuItems()
        assert( menuList.length > 2 )
        const header = LS.getHeader('Angie')
        console.log(`Header: ${JSON.stringify(header,undefined,2)}`)
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
*/