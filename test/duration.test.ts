import { LeadSheet } from "../LeadSheet.ts"
import * as path from "https://deno.land/std/path/mod.ts";
import { assert, assertExists , assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Parser } from "../imports.ts"
import  LR  from "../rules/lexerRules.ts"
import { PR } from "../rules/parserRules.ts"
const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }
// const _debug_hook = __dirname

Deno.test({
    name: '05 - Leadsheet can read the parseTree', 
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = 'validate'
        await LS.loadAllSheets()
        await LS.renderVextab('Default', true)
        const vexTree = LS.vexed.get('Default')?.sections.get('Intro')
        assertEquals(vexTree![0], "notes | :2S B/4 $.top.$ $.big.Gadd9$ :2S B/4 $.big.Am79$ | :2S B/4 $.big.Cmaj79$ :2S B/4 $.big.Bm7$ | :2S B/4 $.big.Gadd9$ :2S B/4 $.big.Am79$ | :8S B/4 $.big.Cmaj79$ :4S B/4 :8S B/4 $.big.D7sus4$ :2S tB/4 |") 
    },
    sanitizeResources: false,
    sanitizeOps: false
})

/*
Deno.test({
    name: '06 - Leadsheet can generation correct vextab durations', 
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = 'off'
        await LS.loadAllSheets()
        await LS.renderVextab(`I'm a Mover`, true)
        const vexTree = LS.vexed.get(`I'm a Mover`)?.sections.get('Chorus')
        assertEquals(vexTree![0], "notes | :1S B/4 $.top.$ $.big.Fmaj7$ | :1S B/4 $.big.Gmaj7$ |") 
                              //  "notes | :2S B/4 $.top.$ $.big.Gadd9$ :2S B/4 $.big.Am79$ | :2S B/4 $.big.Cmaj79$ :2S B/4 $.big.Bm7$ | :2S B/4 $.big.Gadd9$ :2S B/4 $.big.Am79$ | :8S B/4 $.big.Cmaj79$ :4S B/4 :8S B/4 $.big.D7sus4$ :2S tB/4 |"
    },
    sanitizeResources: false,
    sanitizeOps: false
})

Deno.test({
    name: '07 - Leadsheet can generate ChordPro sheet', 
    fn: async () => {  
        const LS = new LeadSheet( "../sheets", '.txt')
        LS.debug = 'debug'
        await LS.loadAllSheets()
        await LS.renderVextab(`I'm a Mover`, true)
        let vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Intro')
        assertEquals(vexTree![0],"[|] [Gadd9] [Am79] [|] [Cmaj79] [Bm7] [|] [Gadd9] [Am79] [|] [Cmaj79] [D7sus4] [|]")
        vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Verse 1')
        assertEquals(vexTree![0],"[|][Gadd9]I was born by the [Am79]river. [|][Cmaj79]Just like this [Bm7]river I been")
        vexTree = LS.vexed.get(`I'm a Mover`)?.sectionsCP.get('Chorus')
        assertEquals(vexTree![0],"[|][Fmaj7]Mover babe. I’m a [|][Gmaj7]mover") 
        assertEquals(vexTree![1],"[F6]Nothing seems to [E7]slow [E7]me [Ebmaj79]down [|][Ebmaj79]")

    },
    sanitizeResources: false,
    sanitizeOps: false
})

// TODO: This need additional testing, e.g. for divisions of 3
*/