import { assert, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { LeadSheet } from "../LeadSheet.ts"
import * as path from "https://deno.land/std/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { Parser } from "https://deno.land/x/parlexa@v2.2.5/Parser.ts";

const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }
const debug_hook = __dirname

Deno.test({
    name: '05 - Leadsheet can read the parseTree', 
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = false
        await LS.loadAllSheets()
        await LS.renderVextab('Default', true)
        // const parseTree = LS.parsed.get('Default')
        // Deno.writeTextFile('./pars.txt',`${JSON.stringify(parseTree, undefined, 2)}`, { append: false} )
        const vexTree = LS.vexed.get('Default')?.sections.get('Intro')
        // Deno.writeTextFile('./vex.txt',`${JSON.stringify(vexTree![0], undefined, 2)}`, { append: false} )
        assertEquals(vexTree![0], "notes | :2S B/4 $.top.$ $.big.Gadd9$ :2S B/4 $.big.Am79$ | :2S B/4 $.big.Cmaj79$ :2S B/4 $.big.Bm7$ | :2S B/4 $.big.Gadd9$ :2S B/4 $.big.Am79$ | :8S B/4 $.big.Cmaj79$ :4S B/4 :8S B/4 $.big.D7sus4$ :2S tB/4 |") 
                              //  "notes | :2S B/4 $.top.$ $.big.Gadd9$ :2S B/4 $.big.Am79$ | :2S B/4 $.big.Cmaj79$ :2S B/4 $.big.Bm7$ | :2S B/4 $.big.Gadd9$ :2S B/4 $.big.Am79$ | :8S B/4 $.big.Cmaj79$ :4S B/4 :8S B/4 $.big.D7sus4$ :2S tB/4 |"
    },
    sanitizeResources: false,
    sanitizeOps: false
})


Deno.test({
    name: '05 - Leadsheet can generate ChordPro sheet', 
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = false
        await LS.loadAllSheets()
        await LS.renderVextab(`I'm a Mover`, true)
        let vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Intro')
        
        assertEquals(vexTree![0],"[|] [Gadd9] [Am79] [|] [Cmaj79] [Bm7] [|] [Gadd9] [Am79] [|] [Cmaj79] [D7sus4] [|]")
        vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Verse 1')
        
        assertEquals(vexTree![0],"[|][Gadd9]I was born by the [Am79]river. [|][Cmaj79]Just like this [Bm7]river I been")
        // Deno.writeTextFile('./vex.txt',`${JSON.stringify(vexTree![0], undefined, 2)}`, { append: false} )
        vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Chorus')
        assertEquals(vexTree![0],"[|][Fmaj7]Mover babe. I’m a [|][Gmaj7]mover") 
        assertEquals(vexTree![1],"[F6]Nothing seems to [E7]slow [E7]me [Ebmaj79]down [|][Ebmaj79]")
        // console.log(`${JSON.stringify(vexTree![1], undefined, 2)}`)
        // vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Verse 2')
        // console.log(`${JSON.stringify(vexTree![0], undefined, 2)}`)
    },
    sanitizeResources: false,
    sanitizeOps: false
})

// TODO: This need additional testing, e.g. for divisions of 3