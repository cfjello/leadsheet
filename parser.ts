import { Parser, Grammar } from "https://deno.land/x/nearley@2.19.7-deno/mod.ts";

import { lodash as _ } from 'https://deno.land/x/deno_ts_lodash/mod.ts';

import  grammar  from "./grammer.ts"

import  evaluate from './evaluator.ts'

// require("json-circular-stringify")
// const fs = require('fs')

const parser = new Parser(Grammar.fromCompiled(grammar));

// let p = parser.feed(`||:  Am7,2  D7 | Ebmaj7  | Abm6  :||`)

//  [note: This is a note]
// let p = parser.feed(`S Chorus [Meter:4/4] [tempo:120][Swing: 33%] ||: /2+8 Am79 add13-5^1/D  % a4bc5 |[tempo:124] D7/2 <45 :|| [note: This is a note]`)

let p = parser.feed(`
Title: Angie
Author: Rolling Stones
Form:  
  - Intro 
  - Verse
  - Verse 2
  - Intro
  - Verse 3
  - Coda
Key    : A Minor
Meter  : 4/4
Tempo  : 120                

Intro : |: Am |  E7 |  Gsus4 G Fsus4 F | Csus4 C C/B :|
Verse 1 :
|Am	 |E7         |  Gsus4 G Fsus4 F | Csus4 C C/B
_ Angie, _ Angie._ When _will those _dark clouds _ all disap-_pe_er?
|Am     |E7      | Gsus4 G Fsus4 F | Csus4 C
_ Angie, _ Angie  _Where _will it _lead us _from he-e-e-_ere?  With no
|G	         |G              |Dm              |Am
_loving in our _souls and no _money in our _coats
|C	       |F	          |G   |G 
_You can't _say we're satis-_fied
|Am     |E7           |  Gsus4 G Fsus4 F        | Csus4 C
_ Angie, _ Angie. _You _can't _say we _never _tri-_ed



Verse 2:
|Am     |E7             |  Gsus4 G Fsus4 F | Csus4 C C/B
_Angie you're _beautiful _ but _ain't it _time we _said good-_bye
|Am     |E7             |  Gsus4 G Fsus4 F | Csus4 C
_Angie I still _love you _re-member _all those _nights we _cri-ed, All the 
|G             |G                           |Dm              |Am
_dreams we held so _close seemed to _all go up in _smoke
|C           |F	          |G   |G
_Let me _whisper in your e-_ar 
|Am     |E7    |  Gsus4 G Fsus4 F        | Csus4 C
_Angie, _Angie  _where _will it _lead us _from he-_re, 

Verse 3:
|G                   |G             |Dm                 |Am
Oh _Angie don't you _weep  all  your _kisses still taste _sweet
|C           |F               |G |G
_I hate that _sadness in your _eyes _      But
|Am     |E7       |  Gsus4 G Fsus4 F | Csus4 C
_ Angie, _ Angie,  _ain't _it _time we _said good-by-e

Coda:
|Dm	                     |Am   |Dm                               |Am
_Angie, I still love you _baby _Ev'ry where I look I see your _eyes
|Dm	                            |Am    
_There ain't a woman that comes _close to you.
   |C        F               |G
So _come on _baby dry your _eyes         
|Am     |E7      |  Gsus4 G Fsus4 F | Csus4 C
But _ Angie, _ Angie, _Ain't _it _good to _be a-_li-_ve`)


// console.log(JSON.stringify(p.results, undefined, 2))
let cmdArr= _.flattenDeep(p.results)

// evaluate(cmdArr)

const encoder = new TextEncoder();
const data = encoder.encode( JSON.stringify(cmdArr, undefined, 2) );
Deno.writeFile( './out.json',data )
