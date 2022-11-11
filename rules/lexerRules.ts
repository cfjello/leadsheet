// @deno-types='https://deno.land/x/xregexp/types/index.d.ts'
import XRegExp from  'https://deno.land/x/xregexp/src/index.js'
import { LexerRules } from "https://deno.land/x/parlexa/mod.ts";

const LR: LexerRules = {
    TITLE:      XRegExp( '(?<token>Title)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\-\\.\'’ \\t]+?)[ \\t]*(?=$|\\n)', 'xuig' ),
    AUTHOR:     XRegExp( '(?<token>Author)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\-\\.\'’ \\t]+?)[ \\t]*(?=$|\\n)', 'xuig' ),
    FORM:       XRegExp( '(?<token>Form)[ \\t]*(?<colon>:)[ \\t]*(?=$|\\n)', 'gi' ),
    LIST_ENTRY: {
        match:  XRegExp( '(?<token>\-)[ \\t]*(?<value>[\\p{L}0-9\\-\\. \\t]+?)[ \\t]*(?=$|\\n)', 'xuig'),
        multi: '1:m'
    },
    BAR:          XRegExp('(?<value>\\|{1,2})','xug'),
    SECTION_HEAD: XRegExp( '(?<value>[^_\\|][\\p{L}0-9\\-\\. \\t]+)[ \\t]*(?=\\[)', 'xug' ),
    SECTION:      XRegExp( '(?<value>[\\p{L}0-9\\-\\. \\t]+?)[ \\t]*(?<colon>:)', 'xug' ),
    TEXT:    { 
        match: XRegExp( '(?<value0>_)[ \\t]*(?<value>[\\p{L}0-9\\-\'’ \\t\\p{P}]+)[ \\t]*(?=$|\\n)', 'xug' ),
        // deno-lint-ignore no-explicit-any
        cb: ( e: any ) => { 
            try {
                // e.value = e.value0.trim() + e.value.trim()
                e.value = e.value.trim()
                return e
            }
            catch(err) {
                console.log(`${JSON.stringify(e)} got: ${err}`)
            }
        }
    },
    // TEXT_ONLY: XRegExp( '(?<value>[^:_\\|\\[\\]]+)[ \\t]*(?=$\\n)', 'xug' ),
    NL:     XRegExp('(?<value>[\\n\\r]+?)', 'g'), 
    WS:     XRegExp('(?<value>[ \\t]+)', 'g'),
    SLASH:  XRegExp('(?<value>\/)', 'g'),
    KEY:    XRegExp( '(?<token>Key|K|k)[ \\t]*:', 'xig' ),
    METER:  XRegExp( '(?<token>Meter|M|m)[ \\t]*:[ \\t]*(?<counter>[0-9]{1,2})\/(?<denominator>[0-9]{1,2})[ \\t]*(?=,|\\]|$|\\n)', 'xig' ),
    TEMPO:  XRegExp( '(?<token>Tempo|T|t)[ \\t]*:[ \\t]*(?<value>[0-9]{1,3})[ \\t]*(?=,|\\]|$|\\n)', 'nxig' ),
    USE:    {
        match: XRegExp('(?<token>use|Use|U|u)[ \\t]*(?<colon>:)[ \\t]*(?<value>[^\\],\\n]+),{0,1}[ \\t]*(?<only>textOnly|notesOnly|textAndNotes){0,1}[ \\t]*(?=,|\\])', 'xuig'),
         // deno-lint-ignore no-explicit-any
         cb: (e: any) => {
            try {
                e.type  = 'USE'
                e.value = e.value.trim() 
            }
            catch(err)  { console.log(`USE cb() Error: ${e} ==> ${err}`) }
            return e
        }
    },
    TEXT_NOTE:  XRegExp('(?<token>Note|N|n)[ \t]*\:[ \t]*(?<value>[^\\],\\n]+)[ \\t]*(?=,|\\]|$|\\n)', 'xuig'),
    TEXT_NOTE2: XRegExp('(?<token>@)(?<who>[\\p{L}0-9\- \\t]+?)[ \t]*(?<colon>[\:])[ \t]*(?<value>[^\\],\\n]+)[ \\t]*(?=,|\\]|$|\\n)', 'xuig'),
    SCALE: { 
        match:  XRegExp( '(?<token>Scale|S|s)[ \\t]*:', 'xig' ),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            e.type  = 'SCALE'
            e.value = 'S:'
            return e
        }
    },
    SWING:  XRegExp( '(?<token>Swing)[ \\t]*:[ \\t]*(?<value>[0-9]{1,2}%)[ \\t]*(?=,|\\]|$|\\n)','xig'),
    // REPEAT_END_COUNT:   { match: XRegExp('(?<colon>:)[ \\t]*(?<value>[1-9]{0,2})(?=[ \\t]*\\|)', 'xg') },
    // BAR:                { match: XRegExp( '(?<value>\\|{1,2})', 'xg') },
    REPEAT_COUNT:   XRegExp('(?<value>[1-9]{0,2})[ \\t]*(?<token>:)', 'xg'), 
    REPEAT_END:     XRegExp('[ \\t]*(?<colon>:)[ \\t]*(?=\\|)', 'xg'),
    SQ_BRACKET:     XRegExp( '(?<token>[\\[])', 'g' ),
    SQ_BRACKET_END: XRegExp( '(?<token>[\\]])', 'g'),
    COMMA:          XRegExp('(?<value>,)', 'g'),
    COLON:          XRegExp('(?<value>:)', 'g'),
    DURATION:   { 
        match: XRegExp('(?<token>,)(?<tie>t{0,1})(?<value>[0-9]{1,2})(?<dot>[\\.]{0,2})', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            e.type  = 'DURATION'
            return e
        }
    },
    DURATION2:  { 
        match: XRegExp('(?<token>,)(?<tie>t{0,1})(?<value>[whtq])', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            const tokens = ['w','h','t','q']
            e.value = tokens.indexOf(e.token) + 1
            e.type  = 'DURATION'
            return e
        }
    },
    DURATION_ADD:   { 
        match: XRegExp('(?<token>[\-\+]{1})(?<value>[0-9]{1,2})', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            e.type  = 'DURATION_ADD'
            return e
        }
    },
    GROOVE_ADJUST:  XRegExp('(?<direction>[<|>])(?<value>[0-9]{1,3})', 'xg'),
    CHORD_NOTE: { 
        match: XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})(?![^\\n]*_)', 'xg'),
        multi: '1:1',
    },
    REST: {
        match: XRegExp('(?<value>R)', 'xig'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            e.type  = 'REST'
            return e
        }
    },
    CHORD_TYPE: XRegExp('(?<value>[S|s]us2|[S|s]us4|[D|d]im|[A|a]ug|[M|m]ajor|[M|m]aj|[M|m]inor|[Q|q]uatal|[M|m]in|M|m|Q|q|5)', 'ixg'),
    CHORD_EXT:  XRegExp('(?<value>b5|#5|6|7|9|b9|#9|11|#11|b13|13)', 'g'),
    CHORD_EXT2: XRegExp('(?<value>add2|add#5|add9|sus2|sus4|add11|add#11|add13)', 'g'),
    CHORD_BASS: XRegExp('(?<token>\/)(?<value>[A|B|C|D|E|F|G|a|b|c|d|e|f|g][#|b]{0,1})', 'xg'),
    CHORD_INVERSION: XRegExp('(?<token>[\\^|v])(?<value>[0-5])', 'xg'),
    CHORD_MINUS_NOTE:{
        match: XRegExp('(?<value>\\-1|\\-3|\\-5|no3|no5|no1)', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any ) => {
            e.value = e.value.replace('-','no')
            return e
        }
    },
    CHORD_COMMENT: XRegExp('(?<lp>\\[)[ \\t]*(?<value>[^\\]]*)[ \\t]*(?<rp>\\])', 'xg'),
    REPEAT_PREV: XRegExp('(?<token>%)', 'xg'),
    // DRUM_KIT:           /bd|sn|ki|hh|oh|ht|mt|lt|cy|cr|cow|tam/,
    NOTE_LOWER:  XRegExp('(?<value>a|b|c|d|e|f|g)(?<sharpFlat>[#|b]{0,1})', 'xg'),
    NOTE_UPPER:  XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xg') ,
    NOTE_BOTH:   XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xig') ,
    // MAJOR: 
    MINOR_MOD: XRegExp('(?<value>Harmonic|Harm|Har|Melodic|Mel)\\.{0,1}[ \\t]*(?!:)','xig') ,
    MINOR:     XRegExp('(?<value>Minor|minor|Min|min|m)[ \\t]*(?![a-z:])', 'xg'),
    MAJOR:     XRegExp('(?<value>Major|Maj|M)[ \\t]*(?![a-z:])', 'xg'),
    MODE:      XRegExp('(?<value>Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Natural|Nat|Locrian|Loc)\\.{0,1}','xig'),
    REPEAT_CHORD: XRegExp('(?<value>\/)', 'xg'),
    REPEAT_BAR:   XRegExp('(?<value>%)', 'xg'),
}

export default LR