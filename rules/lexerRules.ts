// @deno-types='https://deno.land/x/xregexp/types/index.d.ts'
import XRegExp from  'https://deno.land/x/xregexp/src/index.js'
import { MatchRecordExt } from '../imports.ts';
import { UserData } from './parserRules.ts';

export const LR = {
    TITLE:      XRegExp( '(?<keyWord>Title)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\-\\.\'’ /\\t]+)[ \\t]*(?=$|\\n)', 'xuig' ),
    AUTHOR:     XRegExp( '(?<keyWord>Author)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\-\\.\'’ /\\t]+)[ \\t]*(?=$|\\n)', 'xuig' ),
    FORM:       XRegExp( '(?<keyWord>Form)[ \\t]*(?<colon>:)', 'gi' ),
    LIST_ENTRY:  XRegExp( '(?<value>[[\\p{L}0-9\\-\\.\'’ /\\t]+)', 'xug'),    
    BAR:          XRegExp('(?<value>\\|{1,2})','xug'),
    RESERVED:      XRegExp( '(Title|Author|Tempo|Key|Meter|Form)[ \\t]*(?<colon>:)', 'xuig'  ),
    SECTION_HEAD: XRegExp( '(?<value>[^\\.\\|][\\p{L}0-9\\-\\.\'’ /\\t]+)(?=[ \\t]*[\\[:])', 'xug' ),
    // SECTION:      XRegExp( '(?<value>[\\p{L}0-9\\-\\. \\t]+?)[ \\t]*(?<colon>:)', 'xug' ),
    // DOT_SINGLE:   XRegExp('(?<value>\\.)(?!\\.)','xug'),
    // DOT_ESC:      XRegExp('(?<value>\\\\\\\\.)','xug'),
    // DOT_DOUBLE:   XRegExp('(?<value>\\.\\.)','xug'),
    // LYRICS_:    XRegExp('(?<value>[^\\|\\:])','xug'),
    TEXT_LINE: XRegExp('(?=_)','xug'),
    TEXT:    { 
        match: XRegExp( '(?<keyWord>_)(?<value>[\\p{L}0-9\\-\'’ /\\t\\.]+)', 'xug' ),  
        cb: ( m: MatchRecordExt<string>, _u: UserData ) => { 
            try {
                m.value = m.value.toString().trim()
            }
            catch(err) {
                console.log(`${JSON.stringify(m)} got: ${err}`)
            }
        }
    },
    // TEXT_ONLY: XRegExp( '(?<value>[^:_\\|\\[\\]]+)[ \\t]*(?=$\\n)', 'xug' ),
    NL:     XRegExp('(?<value>[\\n\\r]+?)', 'g'), 
    WS:     XRegExp('(?<value>[ \\t]+)', 'g'),
    WS_TAIL:     XRegExp('(?<value>[ \\t]+)(?=$|\\n)', 'g'),
    SLASH:  XRegExp('(?<value>\/)', 'g'),
    KEY:    XRegExp( '(?<keyWord>Key|K|k)[ \\t]*:', 'xig' ),
    METER:  XRegExp( '(?<keyWord>Meter|M|m)[ \\t]*:[ \\t]*(?<counter>[0-9]{1,2})\/(?<denominator>[0-9]{1,2})[ \\t]*(?=,|\\]|$|\\n)', 'xig' ),
    TEMPO:  XRegExp( '(?<keyWord>Tempo|T|t)[ \\t]*:[ \\t]*(?<value>[0-9]{1,3})[ \\t]*(?=,|\\]|$|\\n)', 'nxig' ),
    USE:    {
        match: XRegExp('(?<keyWord>use|Use|U|u)[ \\t]*(?<colon>:)[ \\t]*(?<value>[^\\],\\n]+),{0,1}[ \\t]*(?<only>textOnly|notesOnly|textAndNotes){0,1}[ \\t]*(?=,|\\])', 'xuig'),
         cb: ( m: MatchRecordExt<string>, _u: UserData ) => {
            try {
                m.token  = 'USE'
                m.value = m.value.toString().trim() 
            }
            catch(err)  { console.log(`USE cb() Error: ${m} ==> ${err}`) }
            return m
        }
    },
    TEXT_NOTE:  XRegExp('(?<keyWord>Note|N|n)[ \t]*\:[ \t]*(?<value>[^\\],\\n]+)[ \\t]*(?=,|\\]|$|\\n)', 'xuig'),
    TEXT_NOTE2: XRegExp('(?<keyWord>@)(?<who>[\\p{L}0-9\- \\t]+?)[ \t]*(?<colon>[\:])[ \t]*(?<value>[^\\],\\n]+)[ \\t]*(?=,|\\]|$|\\n)', 'xuig'),
    SCALE: { 
        match:  XRegExp( '(?<keyWord>Scale|S|s)[ \\t]*:', 'xig' ),
        cb: ( m: MatchRecordExt<string>, _u: UserData ) => {
            m.token  = 'SCALE'
            m.value = 'S:'
        }
    },
    SWING:  XRegExp( '(?<keyWord>Swing)[ \\t]*:[ \\t]*(?<value>[0-9]{1,2}%)[ \\t]*(?=,|\\]|$|\\n)','xig'),
    // REPEAT_END_COUNT:   { match: XRegExp('(?<colon>:)[ \\t]*(?<value>[1-9]{0,2})(?=[ \\t]*\\|)', 'xg') },
    // BAR:                { match: XRegExp( '(?<value>\\|{1,2})', 'xg') },
    REPEAT_COUNT:   XRegExp('(?<value>[1-9]{0,2})[ \\t]*(?<token>:)', 'xg'), 
    REPEAT_END:     XRegExp('[ \\t]*(?<colon>:)[ \\t]*(?=\\|)', 'xg'),
    SQ_BRACKET:     XRegExp( '(?<keyWord>[\\[])', 'g' ),
    SQ_BRACKET_END: XRegExp( '(?<keyWord>[\\]])', 'g'),
    BRACKET:        XRegExp( '(?<keyWord>[\\()])', 'g' ),
    BRACKET_END:    XRegExp( '(?<keyWord>[\\)])', 'g'),
    COMMA:          XRegExp('(?<value>,)', 'g'),
    COLON:          XRegExp('(?<value>:)', 'g'),  // [^\\\\]
    COLON_ESC:      XRegExp('[\\\\](?<value>:)', 'g'),
    DURATION:   { 
        match: XRegExp('(?<keyWord>,)(?<tie>t{0,1})(?<value>[0-9]{1,2})(?<dot>[\\.]{0,2})', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            e.token  = 'DURATION'
            return e
        }
    },
    DURATION2:  { 
        match: XRegExp('(?<keyWord>,)(?<tie>t{0,1})(?<value>[whtq])', 'xg'),
        // deno-lint-ignore no-explicit-any
        cb: (e: any) => {
            const tokens = ['w','h','t','q']
            e.value = tokens.indexOf(e.token) + 1
            e.token  = 'DURATION'
            return e
        }
    },
    DURATION_ADD:   { 
        match: XRegExp('(?<keyWord>[\-\+]{1})(?<value>[0-9]{1,2})', 'xg'),
        cb: ( m: MatchRecordExt<string>, _u: UserData ) => {
            m.token  = 'DURATION_ADD'
        }
    },
    GROOVE_ADJUST:  XRegExp('(?<direction>[<|>])(?<value>[0-9]{1,3})', 'xg'),
    CHORD_NOTE: XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})(?![^\\n]*_)', 'xg'),
    REST: {
        match: XRegExp('(?<value>R)', 'xig'),
        cb: ( m: MatchRecordExt<string>, _u: UserData  ) => {
            m.token  = 'REST'
        }
    },
    CHORD_TYPE: XRegExp('(?<value>[S|s]us2|[S|s]us4|[D|d]im|[A|a]ug|[M|m]ajor|[M|m]aj|[M|m]inor|[Q|q]uatal|[M|m]in|M|m|Q|q|5)', 'ixg'),
    CHORD_EXT:  XRegExp('(?<value>b5|#5|\\+|6|7|9|b9|#9|11|#11|b13|13)', 'g'),
    CHORD_EXT2: XRegExp('(?<value>add2|add#5|add9|sus2|sus4|add11|add#11|add13)', 'g'),
    CHORD_BASS: XRegExp('(?<keyWord>\/)(?<value>[A|B|C|D|E|F|G|a|b|c|d|e|f|g][#|b]{0,1})', 'xg'),
    OCTAVE: XRegExp('(?<token>\/)(?<value>\\-2|\\-1|0|1|2|3|4|5|6)', 'xg'),
    CHORD_INVERSION: XRegExp('(?<keyWord>[\\^|v])(?<value>[0-5])', 'xg'),
    CHORD_MINUS_NOTE:{
        match: XRegExp('(?<value>\\-1|\\-3|\\-5|no3|no5|no1)', 'xg'),
        cb: ( m: MatchRecordExt<string>, _u: UserData  ) => {
            m.value = m.value.toString().replace('-','no')
        }
    },
    CHORD_COMMENT: XRegExp('(?<lp>\\[)[ \\t]*(?<value>[^\\]]*)[ \\t]*(?<rp>\\])', 'xg'),
    REPEAT_PREV: XRegExp('(?<keyWord>%)', 'xg'),
    DRUM_KIT:    XRegExp('(?<value>bd|sn|ki|hh|oh|ht|mt|lt|cy|cr|co|cow|ta|tam)', 'xg'),
    NOTE_LOWER:  XRegExp('(?<value>a|b|c|d|e|f|g)(?<sharpFlat>[#|b]{0,1})', 'xg'),
    NOTE_LINK:   XRegExp('(?<value>[\\-1]{0,1})', 'xg'),
    NOTE_UPPER:  XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xg') ,
    NOTE_BOTH:   XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xig') ,
    // MAJOR: 
    MINOR_MOD: XRegExp('(?<value>Harmonic|Harm|Har|Melodic|Mel|Pentatonic|Penta|Pen)\\.{0,1}[ \\t]*(?!:)','xig') ,
    MINOR:     XRegExp('(?<value>Minor|minor|Min|min|m)[ \\t]*(?![a-z:])', 'xg'),
    MAJOR:     XRegExp('(?<value>Major|Maj|M)[ \\t]*(?![a-z:])', 'xg'),
    MODE:      XRegExp('(?<value>Blues|Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Natural|Nat|Locrian|Loc)\\.{0,1}','xig'),
    REPEAT_CHORD: XRegExp('(?<value>\/)', 'xg'),
    REPEAT_BAR:   XRegExp('(?<value>%)', 'xg'),
}

export default LR