import { CHAR_FORWARD_SLASH } from "https://deno.land/std@0.127.0/path/_constants.ts";
import { Keys, ParserRules } from "https://deno.land/x/parlexa/mod.ts"
import LR from "./lexerRules.ts";

//
// User defined group-tokens for this set of parser rules
//
export type ParserTokens = 'reset' | 'header' | 'space' | 'form' |
        'allways' | 'duration' | 'barEntry' | 'chord' | 'common' | 'commonList'| 
        'inline' | 'note' | 'scale' | 'key' | 'scaleList' | 'scaleMode' | 'minor' | 'section' | 'sectionExt'
//
// ParserRules groups (key tokens below) are typed as the combination of the user defined  
// ParserTokens (above) and the LexerRules instanse (LR) keys
// 
export const PR: ParserRules<Keys<ParserTokens, typeof LR>> = {
    always : {  
        expect: [
            [ LR.WS , '0:m', 'ignore'],
            [ LR.NL,  '0:m' ]
        ]
    },
    duration: {     
        expect: [ 
            [ LR.DURATION,     '1:1', 'xor' ], 
            [ LR.DURATION2,    '1:1' ],
            [ LR.DURATION_ADD, '0:m' ]
        ]
    },
    sectionExt: {
        multi: '0:1',
        expect: [
            [ LR.SECTION_HEAD, '1:1' ],
            [ 'inline', '0:m'],
            [ LR.COLON, '1:1' ]
        ]
    },
    section: {
        expect: [
            [ 'sectionExt' , '1:1', 'xor'],
            [ LR.SECTION, '1:1'],
            LR.BAR
        ]
    },
    header: {
        expect: [
            [ LR.TITLE,  '0:1' ],
            [ LR.AUTHOR, '0:1' ], 
            [ LR.METER,  '0:1' ],
            [ LR.TEMPO,  '0:1' ],
            [ 'key', '0:1'],
            [ LR.FORM,   '0:1' ]
        ] 
    },
    reset: { 
        multi: '1:m',
        expect: [
           'header',
           'common', 
            'section',
            LR.BAR,
            'inline',
            LR.TEXT,
            // LR.TEXT_ONLY,
        ] 
    },
    FORM: {
        multi: '1:m',
        expect: [ 
            [LR.LIST_ENTRY, '1:m' ]
        ]
    },
    commonList : {
        multi: '1:m',
        expect: [
            [ LR.COMMA, '1:1'  ],
            [ 'common', '1:1' ],
        ]
    }, 
    common: {
        expect: [
            'key',
            LR.METER,
            LR.TEMPO,
            LR.MODE,
            LR.TEXT_NOTE,
            LR.TEXT_NOTE2,
            'scale',
            LR.SWING,
            LR.USE,
            ['commonList', '0:m']
        ]
    },
    inline: {
        expect: [
            [ LR.SQ_BRACKET, '1:1'],
            ['common', '1:1'],
            [ LR.SQ_BRACKET_END, '1:1']
        ]
    },
    BAR: {
        multi: '1:m',
        expect: [
            [ LR.REPEAT_COUNT, '0:m'],
            'barEntry',
            [ LR.REPEAT_END,  '0:2' ]
        ]
    },
    barEntry: {
        expect: [
            [ 'chord',  '0:1', 'xor' ],
            [ LR.REST, '0:1', 'xor'],
            [ LR.REPEAT_LAST, '0:1', 'xor'],
            [ 'inline', '0:1' ]
        ]
    },
  
    chord: {
        expect: [
            [ LR.CHORD_NOTE, '1:1' ],
            [ LR.CHORD_TYPE, '0:1'],
            LR.CHORD_EXT,
            LR.CHORD_EXT2,
            LR.CHORD_MINUS_NOTE,
            [LR.CHORD_BASS, '0:1'],
            [ 'duration', '0:1' ],
            // LR.CHORD_COMMENT,
            [LR.GROOVE_ADJUST, '0:1']
        ]
    },
    REST: {
        expect: [
            [ 'duration', '0:1']
        ]
    },
    note: {
        expect: [
            [LR.NOTE_UPPER, 'xor'],
            [LR.NOTE_LOWER, 'xor'],
            [LR.NOTE_BOTH]
        ]
    },
    minor: {
        multi: '0:1',
        expect: [
            [LR.MINOR_MOD, '0:1'],
            [LR.MINOR, '1:1']
        ]
    },
    scaleList: {
        multi: '0:m',
        expect: [
            [LR.SLASH, '1:1'],
            ['scaleMode', '1:1']
        ]

    },
    scaleMode: {
        multi: '1:1',
        expect: [
            [LR.NOTE_BOTH, '1:1'],
            [LR.MODE, '0:1', 'or'],
            ['minor', '0:1' , 'or'],
            [LR.MAJOR, '0:1'],
            ['scaleList', '0:m']
        ]
    },
    scale: {
        expect: [
            [LR.SCALE,    '1:1' ],
            ['scaleMode', '1:1']
        ],
    },
    key: {
        multi: '0:1',
        expect: [
            [LR.KEY, '1:1'],
            ['scaleMode', '1:1'],
            [LR.NL, '1:m']
        ]
    },
}

export default PR