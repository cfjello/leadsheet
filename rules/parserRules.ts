import { Matcher } from "https://deno.land/x/parlexa/interfaces.ts";
import { Keys, ParserRules } from "https://deno.land/x/parlexa/mod.ts"
// import { Keys, ParserRules } from "../../parlexa/mod.ts"
// import { Matcher } from "../../parlexa/interfaces.ts"
import LR from "./lexerRules.ts";

//
// User defined group-tokens for this set of parser rules
//
export type ParserTokens = 'reset' | 'header' | 'space' | 'form' | 'barLine' | 'barInLine' |
        'allways' | 'duration' | 'barEntry' | 'chord' | 'common' | 'commonList'| 'noteList' |
        'inline' | 'note' | 'scale' | 'key' | 'scaleList' | 'scaleMode' | 'scaleCmd' |
        'minor' | 'section' | 'sections' | 'sectionExt' | 'sectionLines' | 'keyCmd' | 'keyWords' | 
        'noteGroup'
//
// ParserRules groups (key tokens below) are typed as the combination of the user defined  
// ParserTokens (above) and the LexerRules instanse (LR) keys
// 
export const PR: ParserRules<Keys<ParserTokens, typeof LR>> = {
    always : {  
        expect: [
            [ LR.WS , '0:m', 'ignore'],
            {
                match: LR.NL,
                multi: '0:1', 
                cb: (m, s) => { s.comment = 'This is parser global user defined data' ;return m }
            } as Matcher
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
            ['sectionLines',  '1:m']
        ]
    },
    header: {
        expect: [
            LR.TITLE,
            LR.AUTHOR, 
            LR.METER,
            LR.TEMPO,
            'keyCmd',
            'scaleCmd'
        ]
    },
    keyWords: {
        expect: [
            'header',
            LR.FORM
        ]
    },
    sectionLines: {
        expect: [
            'barLine',
            LR.TEXT
        ]
    },
    sections: {
        expect: [
            ['keyWords', '1:1', 'xor'],
            [ 'section' , '1:1'],
        ]
    },
    reset: { 
        multi: '1:m',
        expect: [
            'sections'
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
    barInLine: {
        multi: '0:m',
        expect: [
            [ LR.BAR, '1:1'],
            [ LR.REPEAT_COUNT, '0:1' ],
            [ 'barEntry' , '0:m'],
            [ LR.REPEAT_END,  '0:1' ]
        ]
    },
    barLine: {
        multi: '0:m',
        line: true,
        expect: [
           'barInLine'
        ]
    },
    barEntry: {
        multi: '1:m',
        expect: [
            [ 'chord',  '1:1', 'xor' ],
            [ LR.REST, '1:1', 'xor'],
            [ LR.REPEAT_CHORD, '1:1', 'xor'],
            [ LR.REPEAT_BAR, '1:1', 'xor'],
            [ 'inline', '1:1' ]
        ]
    },
    chord: {
        multi: '0:m',     
        expect: [
            [ LR.CHORD_NOTE, '1:1' ],
            [ LR.CHORD_TYPE, '0:1'],
            LR.CHORD_EXT,
            LR.CHORD_EXT2,
            LR.CHORD_MINUS_NOTE,
            [LR.CHORD_BASS, '0:1'],
            [ 'duration', '0:1' ],
            [LR.GROOVE_ADJUST, '0:1']
        ],
    },
    REST: {
        expect: [
            [ 'duration', '0:1']
        ]
    },
    noteList: {
        multi: '0:m',
        expect: [
            [LR.COMMA, '1:1'],
            ['note', '1:1']
        ]
    },
    note: {
        expect: [
            [LR.NOTE_LOWER, '1:1'],
            [LR.OCTAVE, '0:1'],
            ['noteList', '0:m']
        ]
    },
    noteGroup: {
        expect: [
            [LR.BRACKET, '1:1'],
            ['note', '1:m'],
            [LR.BRACKET_END, '1:1'],
        ]
    },
    notes:  {
        expect: [
            ['note', '1:1', 'xor'],
            ['noteGroup', '1:1']
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
            [LR.COMMA, '1:1', 'xor'],
            [LR.SLASH, '1:1'],
            ['scaleMode', '1:1']
        ]

    },
    scaleMode: {
        multi: '1:m',
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
    scaleCmd: {
        line: true,
        expect: [
            [LR.SCALE,    '1:1' ],
            ['scaleMode', '1:1']
        ],
    },
    key: {
        multi: '0:1',
        expect: [
            [LR.KEY, '1:1'],
            ['scaleMode', '0:1'],
        ]
    },
    keyCmd: {
        line: true,
        expect: [
            [LR.KEY, '1:1'],
            ['scaleMode', '0:1'],
        ]
    },
}

export default PR