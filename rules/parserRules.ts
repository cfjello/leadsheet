import { Keys, ParserRules } from "https://deno.land/x/parlexa/mod.ts"
import LR from "./lexerRules.ts";

//
// User defined group-tokens for this set of parser rules
//
export type ParserTokens = 'reset' | 'header' | 'space' | 'form' |
        'allways' | 'duration' | 'chord' | 'common' | 'commonList'| 
        'inline' | 'note' | 'scale' | 'scaleMode' | 'minor'
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
    SECTION: { 
        expect: [
            LR.BAR,
            // LR.SQ_BRACKET
        ]
    },
    header: {
        expect: [
            [ LR.TITLE,  '0:1' ],
            [ LR.AUTHOR, '0:1' ], 
            [ LR.FORM,   '0:1' ]
        ] 
    },
    reset: { 
        multi: '1:m',
        expect: [
           'header' ,
           'common', 
            LR.SECTION,
            LR.BAR,
            LR.TEXT
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
            LR.KEY,
            LR.METER,
            LR.TEMPO,
            LR.MODE,
            LR.TEXT_NOTE,
            LR.TEXT_NOTE2,
            [ LR.SCALE, '0:1' ],
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
            [ LR.CHORD_NOTE , '1:1', 'xor'],
            [ LR.REST,        '1:1', 'xor'],
            [ LR.REPEAT_LAST, '1:1', 'xor'],
            // [ LR.SQ_BRACKET,  '1:1', 'xor'],
            [ LR.REPEAT_END,  '1:1' ]
        ]
    },
    CHORD_NOTE: {
        expect: [
            LR.CHORD_TYPE,
            LR.CHORD_EXT,
            LR.CHORD_EXT2,
            'inline',
            [LR.CHORD_BASS, '0:1'],
            LR.CHORD_MINUS_NOTE,
            [ 'duration', '0:1' ],
            LR.CHORD_COMMENT,
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
        expect: [
            [LR.MINOR_MOD, '0:1'],
            [LR.MINOR, '1:1']
        ]

    },
    scaleMode: {
        multi: '1:1',
        expect: [
            [LR.MODE, 'xor'],
            ['minor', 'xor'],
            [LR.MAJOR]
        ]
    },
    scale: {
        expect: [
            [LR.NOTE_BOTH, '1:1'],
            ['scaleMode', '1:1']
        ]
    },
    SCALE: {
        expect: [
            ['scale', '1:1']
        ]
    },
    KEY: {
        expect: [
            ['scale', '1:1']
        ]
    },
}

export default PR