import { ParserRules } from "../imports.ts"
import LR from "./lexerRules.ts";

//
// User defined group-tokens for this set of parser rules
//
export type ParserTokens = 'reset' | 'header' | 'headerItem' | 'space' | 'form' | 'barLine' | 
        'always' | 'duration' | 'barEntry' | 'chord' | 'common' | 'commonList'| 'noteList' |
        'inline' | 'note' | 'scale' |  'scaleList' | 'scaleMode' | 'scaleCmd' |
        'minor' | 'section' | 'sectionExt' | 'sectionLines' | 'keyCmd' | 'textLine' | 'textItem' |
        'noteGroup' | 'formList' | 'notes' | 'titleItem' | 'authorItem' | 'meterItem' | 'tempoItem' | 
        'keyCmdItem'  | 'scaleCmdItem' | 'formItem'

export type UserData = { 
    id: string,
    snipped: string
} 

export type LexerTokens = keyof typeof LR 

export type Tokens = LexerTokens | ParserTokens 


export const PR: ParserRules< Tokens, UserData> = {
    always : {  
        multi: '0:m',
        expect: [
            [ LR.WS , '0:m', 'ignore'],
            [ LR.NL, '0:m', 'ignore']
        ]
    },
    duration: {     
        expect: [ 
            [ LR.DURATION,     '0:1', 'xor' ], 
            [ LR.DURATION2,    '0:1' ],
            [ LR.DURATION_ADD, '0:m' ]
        ]
    },
    /*
    sectionExt: {
        multi: '0:1',
        expect: [       
            [ LR.SECTION_HEAD, '1:1' ],
            [ 'inline', '0:m'],
            [ LR.COLON, '1:1' ]
        ]
    },
    */
    section: {
        multi: '1:m',
        expect: [
            [ LR.RESERVED, '0:0'],
            [ LR.SECTION_HEAD, '1:1' ],
            [ 'inline', '0:m'],
            [ LR.COLON, '1:1' ],
            ['sectionLines',  '0:m']
        ]
    },
    headerItem: {
        multi: '1:m',
        startOn: [LR.NL],
        breakOn: [LR.NL],
        expect: [
            [ LR.TITLE,'xor'],
            [ LR.AUTHOR, 'xor'], 
            [ LR.METER, 'xor'],
            [ LR.TEMPO, 'xor'],
            [ 'keyCmd', 'xor'],
            [ 'scaleCmd','xor'],
            LR.FORM
        ]
    },
    header: {
        multi: '1:m',
        expect: [
            [ 'headerItem', '1:1']
        ]
    },
    sectionLines: {
        multi: '1:m',
        startOn: [LR.NL],
        breakOn: [LR.NL],
        expect: [
            [ LR.COLON, '0:0' ],
            [ 'barLine', 'xor' ],
            [ 'textLine']
        ]
    },
    textItem: {
        expect: [
            [ LR.TEXT , '1:m']
        ]
    },
    textLine: {
        startOn: [LR.NL],
        breakOn: [LR.NL],
        expect: [
            [ 'textItem' , '1:m']
        ]
    },
    reset: { 
        multi: '1:m',
        expect: [
            [ 'header', '1:m' ],
            [ 'section', '1:m' ]
        ] 
    },
    formList: {
        multi: '0:m',
        expect: [ 
            [ LR.COMMA, '1:1'  ],
            [ LR.LIST_ENTRY, '1:1' ]
        ]
    },
    FORM: {
        multi: '1:1',
        startOn: [LR.COLON],
        breakOn: [LR.NL],
        expect: [ 
            [LR.LIST_ENTRY, '1:1' ],
            ['formList', '0:m']
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
            'keyCmd',
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
    barLine: {
        multi: '0:m',
        expect: [
            [ LR.BAR, '1:1'],
            [ LR.REPEAT_COUNT, '0:1' ],
            [ 'barEntry' , '1:m'],
            [ LR.REPEAT_END,  '0:1' ]
        ]
    },
    barEntry: {
        multi: '1:m',
        expect: [
            [ 'chord',  '1:m', 'xor' ],
            [ LR.REST, '1:m', 'xor'],
            [ LR.REPEAT_CHORD, '1:m', 'xor'],
            [ LR.REPEAT_BAR, '1:1', 'xor'],
            [ 'inline', '1:m' ]
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
        expect: [
            [LR.SCALE,    '1:1' ],
            ['scaleMode', '1:1']
        ],
    },
    
    keyCmd: {
        expect: [
            [LR.KEY, '1:1'],
            ['scaleMode', '0:1'],
        ]
    },
}

export default PR