
import XRegExp from './node_modules/xregexp/xregexp-all.js'

export default class Lexer {
    // self = this
    debug = true
    line    = 1
    col     = 1 
    bol     = 0 
    pos     = 0
    matchPositions = new Map()
    initState = []
    state = []
    stateChange = false
    foundToken  = true
    input = ''
    output = []
    nextIdx = 0 

    constructor( initStates = [ 'sheet', 'common', 'section' ] ) {
        this.initStates = initStates
    }

    next(reset = false) {
        if ( reset ) this.nextIdx = 0
        let output 
        if ( this.nextIdx < this.output.length ) {
            output = this.output[this.nextIdx++]
            return { value: output , done: output.offset >= output.size }
        }
        else {
            output = this.output[this.nextIdx]
            return { value: output , done: true }
        }
    }

    push( args ) {
        this.state.push( args )
        this.stateChange = true
    }

    pop() {
        if ( this.state.length > 1 ) {
            this.state.pop()
            this.stateChange = true
        }
    }

    reset( inputStr ) {
        this.input   = inputStr
        this.ln = 1
        this.linePos = 0 
        this.output  = []
        this.nextIdx = 0
        this.push( this.initStates )
        this.matchLoop()
    }

    doMatch( name, matchObj ) {
        if ( this.pos >= this.input.length || this.pos === this.matchPositions.get(name) ) {
            // console.log(`-----> SKIP: ${name}`)
            return false
        }

        let res = XRegExp.exec(this.input, matchObj.match, this.pos, 'sticky' )
        this.matchPositions.set(name, this.pos )
        if ( res ) {
            //
            // Handle position and line numbering
            //
            this.col = this.pos - this.bol + 1
            if ( name === 'NL' ) {
                this.line++
                this.col = 1
                this.bol = matchObj.match.lastIndex 
            }
            let lastPos = this.pos
            this.pos = matchObj.match.lastIndex
            //
            // Add matched record to the output 
            //
            // console.log(`Matched: ${name}, new pos: ${this.pos}`)

            this.foundToken = true
            this.output.push ({ 
                type:  name,
                value: res.value ?? res[0],
                text: res[0],
                offset: lastPos,
                newPos: this.pos,
                ofLen: this.input.length,
                line: this.line,
                col:  this.col
            })
            if ( this.pos > 2030 ) {
                console.log(`Stored  -> ${JSON.stringify(this.output[this.output.length-1])}`)
            }
            this.stateChange = this.setExpect(matchObj)
            return true
        }
        else 
            return false
    }

    finished() {
        let endOfInput = this.pos >= this.input.length
        let outOfMatches = this.state.length === 1 && ( ! this.stateChange && ! this.foundToken )
        return endOfInput || outOfMatches
    }

    setExpect( matchObj ) {
        let stateChange = false
        if ( matchObj.expect && matchObj.expect.length > 0 ) {
            if ( matchObj.expect[0] === 'previous' && this.state.length > 1 ) {
                this.pop()
                this.output.push ({ 
                    type:  'Debug',
                    value: this.state[this.state.length - 1],
                    text: 'matchState -> Previous',
                    offset: this.pos,
                    newPos: this.pos,
                    ofLen: this.input.length,
                    line: this.line,
                    col:  this.col
                })
            }
            else if (matchObj.expect[0] === 'reset' ) {
                this.states = []
                this.push(this.initStates)
                this.output.push ({ 
                    type:  'Debug',
                    value: this.initStates,
                    text: 'matchState -> Reset',
                    offset: this.pos,
                    newPos: this.pos,
                    ofLen: this.input.length,
                    line: this.line,
                    col:  this.col
                })
            } 
            else {
                this.push( matchObj.expect ) 
                this.output.push ({ 
                    type:  'Debug',
                    value: this.state[this.state.length - 1],
                    text: 'matchState -> New state',
                    offset: this.pos,
                    newPos: this.pos,
                    ofLen: this.input.length,
                    line: this.line,
                    col:  this.col
                })
            }
            stateChange = true
        }
        return stateChange
    }

    matchWS() {
        let foundWS = false
        do {
            foundWS = false
            let matchKeys  = Object.keys(this.lexerRules.allways)

            for ( let wsKey of matchKeys ) {
                let wsObj = this.lexerRules.allways[wsKey]
                let res = this.doMatch( wsKey, wsObj )
                foundWS = foundWS ? true : res
            }
        }
        while( foundWS && ! this.finished() )
    }

    matchLoop() {
        while( ! this.finished() ) {
            this.foundToken = false
            this.stateChange = false
            let matchStates = this.state[this.state.length-1]
            for ( let i = 0 ; i < matchStates.length; i++ ) {
                let matchGroupName = matchStates[i]
                let matchGroup = this.lexerRules[matchGroupName + '']
                console.log(`Reading matchGroup ${matchGroupName}`)
                let matchKeys  = Object.keys( matchGroup )
                let prevMatched = true
                for ( let key of matchKeys ) {
                    // console.log(`Getting Key: ${key}`)
                    let matchObj = matchGroup[key]
                    let res = false
                    do {
                        if ( prevMatched ) this.matchWS()
                        res = this.doMatch( key, matchObj )
                        this.foundToken = this.foundToken ? true : res
                       
                        prevMatched = res
                        if ( this.stateChange ) break
                    }
                    while ( res && matchObj.repeat && ! this.stateChange )
                    if ( this.stateChange ) break
                }
                if ( this.stateChange ) break
            }
            if ( this.finished() ) return
            if ( ! this.foundToken ) this.pop() // Throw away the non-matching matchDomain 
        }
    }

    lexerRules = {
        sheet: {
            TITLE: {
                match: XRegExp( '(?<ident>Title)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?=$|\\n)', 'xuig' )
            },
            AUTHOR: {
                match: XRegExp( '(?<ident>Author)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?=$|\\n)', 'xuig' )
            }, 
            FORM: {
                match: XRegExp( '(?<token>Form)[ \\t]*(?<colon>:)[ \\t]*(?=$|\\n)', 'gi' )
            },
            LIST_ENTRY: {
                match: XRegExp( '(?<token>\-)[ \\t]*(?<value>[^\-][\\p{L}0-9\\- \\t]+?)[ \\t]*(?=$|\\n)', 'xug'),
                repeat: true
            },
            STAVE: {
                match: XRegExp('(?<token>\\|{1,2})','xug'),
                expect:  ['staves', 'chords', 'common'] 
            }
        },

        section: {
            SECTION: { match: XRegExp( '(?<value>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?<colon>:)', 'xug' ) },
            TEXT:    { match: XRegExp( '(?<value>[^\|\-|\:][^\|\:]+?)[ \\t]*(?=$|\\n)', 'xug' ) }
        },

        allways: {         
            NL: {
                match: XRegExp('(?<value>\\n)', 'g'), 
                expect: ['reset']
            },
            WS: {
                match: XRegExp('(?<value>[ \\t]+)', 'g')
            },
            COMMA: {
                match: XRegExp('(?<value>,)', 'g')
            },
        },

        common: {
            KEY: {
                match: XRegExp( '(?<token>Key)[ \\t]*\:[ \\t]*(?<note>[A|B|C|D|E|F|G|a|b|c|d|e|f|g])(?<sh_fl>[#|b]{0,1})[ \\t]*(?<mode>Major|Minor)[ \\t]*(?=,|\\]|$|\\n)', 'xig' ),
            },
            METER: {
                match: XRegExp( '(?<token>Meter)[ \\t]*\:[ \\t]*(?<counter>[0-9]{1,2})\/(?<denominator>[0-9]{1,2})[ \\t]*(?=,|\\]|$|\\n)', 'xig' )
            },
            TEMPO: {
                match: XRegExp( '(?<token>Tempo)[ \\t]*\:[ \\t]*(?<value>[0-9]{1,3})[ \\t]*(?=,|\\]|$|\\n)', 'xig' )
            },
            MODE: {
                match: XRegExp('(?<value>Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Locrian|Loc)','ig'),
            },
            USE: {
                match:  XRegExp('(?<token>Use)[ \\t]*(?<colon>[\:])[ \\t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?<=,|\\]|$|\\n)', 'xuig')
            },
            TEXT_NOTE: { 
                match: XRegExp('(?<token> Note)[ \t]*\:[ \t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?=,|\\]|$|\\n)', 'xuig')
            },
            TEXT_NOTE2:          {
                match: XRegExp('(?<token> @)(?<who>[\\p{L}0-9\- \\t]+?)[ \t]*(?<colon>[\:])[ \t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?=,|\\]|$|\\n)', 'xuig')
            },
            SCALE: {
                match: XRegExp( '(?<token>Scale)[ \\t]*\:[ \\t]*(?<note>[A|B|C|D|E|F|G|a|b|c|d|e|f|g])(?<sh_fl>[#|b]{0,1})[ \\t]*(?<mode>Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Locrian|Loc)[ \\t]*(?=,|\\]|$|\\n)', 'xig' ),
            },
            SWING: {
                match: XRegExp( '(?<token>Swing)[ \t]*\:[ \t]*(?<value>[0-9]{1,2}%)[ \\t]*(?=,|\\]|$|\\n)','xig')
            }
        },    

        staves:{
            REPEAT_END_COUNT:   { match: XRegExp('(?<colon>[\:]{1,2})[ \\t]*(?<value>[1-9]{0,2})(?=[ \\t]*\|)', 'xg') },
            BAR:                { match: XRegExp( '(?<token>\\|{1,2})', 'xg') },
            REPEAT_COUNT:       { match: XRegExp('(?<=\|[ \\t]*)(?<value>[1-9]{0,2})[ \\t]*(?<colon>[\:]{1,2})', 'xg') },
            SQ_BRACKET_START:   { match: XRegExp( '(?<token>[\[])', 'g' ), expect: ['common'] },
            SQ_BRACKET_END:     { match: XRegExp( '(?<token>[\]])', 'g'), expect: ['previous'] }
        },

        chords: {
            CHORD_NOTE: { match: XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xg') },
            
            REST:       { match: XRegExp('(?<value>R)', 'xig') },
            CHORD_TYPE: {
                match: XRegExp('(?<value>[S|s]us2|[S|s]us4|[D|d]im|[A|a]ug|[M|m]ajor|[M|m]aj|[M|m]inor|[Q|q]uatal|[M|m]in|M|m|Q|q|5)', 'xg')
            },
            CHORD_EXT:   { 
                match: XRegExp('(?<value>b5|6|7|9|b9|#9|11|#11|b13|13)', 'g'),
                repeat: true
            },
            CHORD_EXT2:  { 
                match: XRegExp('(?<value>add9|add11|add#11|add13)', 'g'),
                repeat: true 
            },
            CHORD_BASS:      { match: XRegExp('(?<token>\/)(?<value>[A|B|C|D|E|F|G|a|b|c|d|e|f|g][#|b]{0,1})', 'xg') },
            CHORD_INVERSION: { match: XRegExp('(?<token>[^|v])(?<value>[0-5])', 'xg') },
            CHORD_MINUS_NOTE:{ match: XRegExp('(?<value>\-1|\-3|\-5)', 'xg') },
            REPEAT_PREV:     { match: XRegExp('(?<token>%)', 'xg') },
            // DRUM_KIT:           /bd|sn|ki|hh|oh|ht|mt|lt|cy|cr|cow|tam/,
            DURATION:        { match: XRegExp('(?<token>\/)(?<value>[0-9]{1,2})', 'xg') },
            DURATION_ADD:    { match: XRegExp('(?<token>[\-\+]{1})(?<value>[0-9]{1,2})', 'xg') },
            GROOVE_ADJUST:   { match: XRegExp('(?<token>[<|>])(?<value>[0-9]{1,3})', 'xg') },
            NOTE:       { match: XRegExp('(?<value>a|b|c|d|e|f|g)(?<sharpFlat>[#|b]{0,1})', 'xg') },
            // NOTE_IC:    { match: XRegExp('(?<value>A|B|C|D|E|F|G|a|b|c|d|e|f|g)(?<sharpFlat>[#|b]{0,1})', 'x') },
        }
    }
}
    
/*
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = lexer;
	} else {
		window.lexer = lexer;
	}
}  
)()
*/
