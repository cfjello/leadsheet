import { VextabHeaderType, VextabDefaults, VextabSectionType, VextabSheetType } from "./interfaces.ts"
// import { reserved, Templating } from "./Templating.ts";
import { _ } from './lodash.ts';

export class Vextab {

    debug = false
    html: string[] = []
    sheet: VextabSheetType
    // sections   = new Map<string, string[]>()
    currSection = ''

    // deno-lint-ignore no-explicit-any
    constructor( public cmds: any[], public conf = { 
        quaterNoteTicks:  420, 
        currTicks:        0,
        currBarSize:      4 * 420 ,
        currBaseUnit:     420,
        currTempo:        120,
        currMeter:        { counter: 4, denominator: 4},

    } as VextabDefaults) {
        this.sheet = {
            header: {
                title:  'Unknown',
                author: 'Unknown',
                tempo:  conf.currTempo ?? 120,
                meter:  conf.currMeter ?? { counter: 4, denominator: 4},
                form: []
            },
            sections: new Map() as VextabSectionType,
            chords:   new Map() as VextabSectionType,
            sectionsCP:   new Map() as VextabSectionType
        }
    }

    getHeader = (): Required<VextabHeaderType> => {
        return this.sheet.header as Required<VextabHeaderType>
    }

    getSheet(): Required<VextabSheetType>  {
        return _.cloneDeep(this.sheet as Required<VextabSheetType>)
    }

    getSections = () => {
        return this.sheet.sections
    }

    // deno-lint-ignore no-explicit-any
    withinStave = ( e: any ) => {
        if ( 
            e.type === 'BAR'   || 
            e.type === 'CHORD' || 
            e.type === 'REST'  || 
            e.type === 'DURATION' ||
            (e.inline !== undefined && e.inline)
        ) 
            return true
        else    
            return false
    }

    lookAhead = ( 
        _keys: string | string[] , 
        idx: number, 
        _ignore: string | string[] = ['WS','NL'],
        _backStop: string | string[] = []  ): any => {
        let res    = undefined
        const keys   = Array.isArray(_keys ) ? _keys : [_keys]
        const ignore = Array.isArray(_ignore ) ? _ignore : [_ignore]
        const backStop = Array.isArray(_backStop ) ? _backStop : [_backStop]
        try {
            while ( idx > 0 && idx < this.cmds.length - 1 ) {
                const entry = this.cmds[++idx]
                if ( ignore.includes(entry.type) ) continue
                if (  backStop.includes(entry.type) ) {
                    break
                }
                if ( keys.includes(entry.type) ) {
                    res = entry
                    break
                }
            }
        }
        catch(err) {
            console.log(`lookAhead: ${err}`)
        }
        return res
        }
    

    lookBehind = ( _keys: string | string[] , 
                   idx: number, 
                   _ignore: string | string[] = ['WS'],
                   _backStop: string | string[] = ['NL']  ): any => {
        let res    = undefined
        const keys   = Array.isArray(_keys ) ? _keys : [_keys]
        const ignore = Array.isArray(_ignore ) ? _ignore : [_ignore]
        const backStop = Array.isArray(_backStop ) ? _backStop : [_backStop]
       
        while ( idx > 0 && idx < this.cmds.length ) {
            const entry = this.cmds[--idx]
            if ( ignore.includes(entry.type) ) continue
            if ( keys.includes(entry.type) || backStop.includes(entry.type) ) {
                res = entry
                break
            }
        }
        return res
    }

    newBarLine = (idx: number) => {
        const entry = this.lookBehind('BAR', idx) 
        return entry.type === 'NL'
    }

    pushNotes = ( barNotes: string[] = [], proChords: string[] ) => {
        let ret = false
        if ( barNotes.length > 0 ) {
            if ( ! this.sheet.sections.has(this.currSection) ) {
                this.sheet.sections.set(this.currSection, [])
                this.sheet.chords.set(this.currSection, [])
            }
            this.sheet.sections.get(this.currSection)!.push('notes ' + barNotes.join(' '))
            this.sheet.chords.get(this.currSection)!.push( proChords.join() )
            ret = true
        }
        return ret
    }

    
    pushText = ( textNotes: string[] = [], textParts: string[] = []) => {
        let ret = false
        try {
            if ( textNotes.length > 0 ) {
                if ( ! this.sheet.sections.has(this.currSection) ) this.sheet.sections.set(this.currSection, [])
                if ( ! this.sheet.sectionsCP.has(this.currSection) ) this.sheet.sectionsCP.set(this.currSection, [])
      
                this.sheet.sections.get(this.currSection)!.push('text ' + textNotes.join(' '))
                
                // Generate the ChordPro text 
                const sectionChords: string[] = this.sheet.chords.get(this.currSection)!
                const chords = sectionChords[sectionChords.length -1].split(',') 
                let chordPro = ""
                let offset = 0
                textParts.forEach( ( value, index ) => {
                    if ( chords[index + offset].startsWith('|') || chords[index + offset].endsWith('|') ) {
                        chordPro += `[${chords[index + offset]}]`
                        offset++
                    }
                    chordPro += `[${chords[index + offset]}]${value}`
                })
                console.log(`push CHORDPRO: ${chordPro}`)
                this.sheet.sectionsCP.get(this.currSection)!.push(chordPro)
                ret = true
            }
        }
        catch(err) {
            console.log(err)
        }
        return ret
    }
    
    render = () => {
        const handled = new Map<string, boolean>()
         // deno-lint-ignore no-explicit-any
        let currElem: any 
        let barNotes:  string[] = []
        // let proNotes:  string[] = []
        let proChords: string[] = []
        let firstChord = true
        let prevChord = 'unset'
        let barsInLastLine = false
        this.html = []
        try {
            this.cmds.forEach( (e, i)  => {
                if ( ! handled.has(e.id) ) {
                    currElem = e
                    switch ( e.type ) {
                        case 'NL':      if ( this.pushNotes(barNotes, proChords) ) { 
                                            barNotes  = []
                                            proChords = []
                                            barsInLastLine = true
                                            firstChord = true
                                        }
                                        handled.set(e.id, true)
                                        break
                        case 'TITLE':   if ( barsInLastLine ) {    
                                            barsInLastLine = false
                                        } 
                                        this.sheet.header.title = e.value
                                        handled.set(e.id, true)
                                        break
                        case 'AUTHOR':  if ( barsInLastLine ) {    
                                            barsInLastLine = false
                                        }
                                        this.sheet.header.author = e.value
                                        handled.set(e.id, true)
                                        break
                        case 'FORM':    {
                                        if ( barsInLastLine ) { 
                                            barsInLastLine = false
                                        }
                                        this.sheet.header.form =  e.formEntries
                                        handled.set(e.id, true)
                                        break
                                        }
                        case 'SECTION': if ( barsInLastLine ) {    
                                            barsInLastLine = false
                                        }
                                        this.currSection = e.value
                                        handled.set(e.id, true)
                                        break
                        case 'BAR':     {
                                            const bar = e.REPEAT_COUNT !== undefined ? '=|:' : '|'
                                            const proBar = e.REPEAT_COUNT !== undefined ? '|:' : '|'
                                            barNotes.push(bar)
                                            proChords.push(proBar)
                                            handled.set(e.id, true)  
                                        }                              
                                        break
                                    
                        case 'CHORD_NOTE': {
                                        const chord = e.fullChord.join('')
                                        const comment = ( e.comment !== '' ? ' (' + e.comment + ')' : e.comment).replace(',', ';')
                                        // set the chord position
                                        const encoding = '$' 
                                        if ( firstChord ) {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 ${encoding}.top.${encoding} ${encoding}.big.${chord}${comment}${encoding}`) 
                                            firstChord = false
                                        }
                                        else if ( chord !== prevChord ) {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 ${encoding}.big.${chord}${comment}${encoding}`)
                                        } 
                                        else {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4`)
                                        }
                                        // add any tied note lengths
                                        for( let i = 1 ; i < e.duration.length; i++ ) {
                                            barNotes.push(` :${e.duration[i]}S tB/4 `)
                                        }
                                        proChords.push(chord)
                                        prevChord = chord
                                        handled.set(e.id, true)                                                            
                                        break
                                        }
                        case 'REST':    {
                                        barNotes.push(`:${e.duration} ${e.tie}##`)
                                        // add any tied note lengths
                                        for( let i = 1 ; i < e.duration.length; i++ ) {
                                            barNotes.push(` :${e.duration[i]}S t## `)
                                        }
                                        proChords.push('R')
                                        handled.set(e.id, true)
                                        break
                                        }
                                        /*
                        case 'SCALE':   {
                                        const mode = e.mode && e.mode.length > 0 ? ` ${e.mode}` : ''
                                        const modifier = e.modifier && e.modifier.length > 0 ? ` ${e.modifier}` : ''
                                        barNotes.push(`$<${e.note}${e.sh_fl ?? ''}${modifier}${mode}>$`) 
                                        handled.set(e.id, true)
                                        break
                                        }
                                    */
                        case 'TEXT': {
                                        const textParts = []
                                        for ( let i = 0 ; i < e.textParts.length ; i++ ) {
                                            const duration = `:${e.textDurations[i][0] === 1 ? 'w' : e.textDurations[i][0]}`
                                            const text     = e.textParts[i].trim().replace(/,/g, '')
                                            if ( i == 0 ) {
                                                textParts.push(duration + ',.10,' + text) 
                                                // prevDuration = duration
                                            }
                                            else {
                                                if ( text.length > 0 )
                                                    textParts.push(',' + duration + ',' + text) 
                                                else 
                                                    textParts.push(',' + duration) 
                                                // prevDuration = duration
                                            }
                                            // Add any additional tied durations
                                            for( let j = 1 ; j < e.textDurations[i].length; j++) {
                                                textParts.push(e.textDurations[i][j] )
                                            }
                                        }
                                        /*
                                        if ( this.pushNotes(barNotes, textParts, i ) ) {
                                            barNotes  = []
                                            textParts = []
                                            barsInLastLine = true
                                            firstChord = true
                                        }
                                        */
                                        this.pushText( textParts, e.textParts )
                                        handled.set(e.id, true)                                                            
                                        break
                                        }
                    }
                }
            })
        }
        catch(err) {
            console.log(`Error: at ${JSON.stringify(currElem)} - ${err}`)
        }
        if ( barNotes.length > 0 ) {
            this.pushNotes(barNotes, proChords) 
        }
    }
}

export default Vextab