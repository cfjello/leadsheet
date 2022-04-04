import { angie } from "./test/Angie.ts"
import { river } from "./test/BornByTheRiver.ts"
import { Parser } from "https://deno.land/x/parlexa@v1.0.3/mod.ts"
import  LR  from "./lexerRules.ts"
import  PR from "./parserRules.ts"

import { lodash as _ } from 'https://deno.land/x/deno_ts_lodash/mod.ts'
import align from "./align.ts"
import Vextab from "./Vextab.ts";

const parser = new Parser( LR, PR, 'reset')
parser.debug = false
// parser.reset(angie)
parser.reset(river)
const tree = parser.getParseTree()
align(tree)

const encoder = new TextEncoder();
const data = encoder.encode( JSON.stringify(tree, undefined, 2) );
Deno.writeFile( './data.json',data )

const html = new Vextab(tree)

html.render()

const encoderHtml = new TextEncoder();
const dataHtml = encoderHtml.encode( html.getSinglePage());
Deno.writeFile( './page.html',dataHtml )

// deno-lint-ignore no-explicit-any
export interface PIndexable { [key: string]: any }