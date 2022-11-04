import { assert, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { LeadSheet } from "../LeadSheet.ts"
import * as path from "https://deno.land/std/path/mod.ts";

const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }
const debug_hook = __dirname

Deno.test({
    name: '05 - Leadsheet can read the parseTree', 
    fn: () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = false
        LS.loadAllSheets()
        // LS.parseAllSheets()
        // const pTree = LS.parsed.get('Default')
        // assert(pTree.length > 100 )
        LS.renderVextab('Default', true)
        const parseTree = LS.parsed.get('Default')
        Deno.writeTextFile('./pars.txt',`${JSON.stringify(parseTree, undefined, 2)}`, { append: false} )
        const vexTree = LS.vexed.get('Default')?.sections.get('Intro')
        Deno.writeTextFile('./vex.txt',`${JSON.stringify(vexTree, undefined, 2)}`, { append: false} )
    },
    sanitizeResources: false,
    sanitizeOps: false
})