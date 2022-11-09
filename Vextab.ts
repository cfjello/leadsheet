import { assert } from "https://deno.land/std/testing/asserts.ts";
import { VextabHeaderType, VextabDefaults, VextabSectionType, VextabSheetType, ChordType, VextabSectionChordType, ChordsAndDurationsType,  RenderSectionType } from "./interfaces.ts"
// import { reserved, Templating } from "./Templating.ts";
import { _ } from './lodash.ts';
import objStringify from "./objStringify.js";

export class Vextab {
    private _debug = false;
    currChordsAndDurations: ChordsAndDurationsType | undefined
    public get debug() {
        return this._debug;
    }
    public set debug(value) {
        this._debug = value;
    }
    html: string[] = []
    sheet: VextabSheetType
    // sections    = new Map<string, string[]>()
    currSection     = ''
    currUseSection  = ''
    currUseTextOnly = false
    currLineCounter = -1
    currUseNotes: string[] = []
    currUseDurations: string[][] = []
    currChordPtr    = 0

    // deno-lint-ignore no-explicit-any
    constructor( public cmds: any[], debug = false, public conf = { 
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
                key:    'C',
                tempo:  conf.currTempo ?? 120,
                meter:  conf.currMeter ?? { counter: 4, denominator: 4},
                form: []
            },
            sections: new Map() as VextabSectionType,
            chords:   new Map() as VextabSectionChordType,
            sectionsCP:   new Map() as VextabSectionType,
            textOnly: new  Map() as VextabSectionType,
            render: new Map() as RenderSectionType
        }
        this.debug = debug
    }

    getHeader = (): Required<VextabHeaderType> => {
        return this.sheet.header as Required<VextabHeaderType>
    }

    getSheet(): Required<VextabSheetType>  {
        return this.sheet as Required<VextabSheetType>
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
            console.error(`lookAhead: ${err}`)
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

    initSection = ( sectionName: string) => {
        assert( ! this.sheet.sections.has(sectionName), `Section: ${sectionName} already exists`)
        this.currSection = sectionName
        // Init Maps
        this.sheet.sections.set(sectionName, [])
        this.sheet.sectionsCP.set(sectionName, [])
        this.sheet.textOnly.set(sectionName, [])
        this.sheet.chords.set(sectionName, [] as ChordType[])
        // Init USE directive 
        this.currChordsAndDurations = undefined
        this.currUseSection = ''  
        this.currUseTextOnly = false
        this.sheet.render.set(this.currSection, 'textAndNotes')
        // Pointers and counters
        this.currChordPtr   = 0
        this.currLineCounter = -1 
    }
        

    newBarLine = (idx: number) => {
        const entry = this.lookBehind('BAR', idx) 
        return entry.type === 'NL'
    }

    pushNotes = ( barNotes: string[] = [], proChords: ChordType[] = [] ): ChordsAndDurationsType | undefined => {
        let ret: ChordsAndDurationsType | undefined
        if ( barNotes.length > 0 ) {
            if ( this.debug ) console.debug(`notes ${barNotes.join(' ')} `)
            this.sheet.sections.get(this.currSection)!.push('notes ' + barNotes.join(' '))
            const currChords =  this.sheet.chords.get(this.currSection)!
            this.currChordPtr = (this.sheet.chords.get( this.currSection) ?? []).length
            
            this.sheet.chords.set( this.currSection, _.concat(currChords, proChords) )
            ret = this.getDurationsInLine(barNotes.join(' '))
        }
        return ret
    }

    getDurationsInLine( notesLine: string ): ChordsAndDurationsType {
        const durations: string[][] = [] 
        const chords: string[] = []
        notesLine.split(':').forEach( (el: string, idx: number) => {
            if ( idx > 0 ) {
                const arr = el.trim().split(' ')
                if ( arr[1].startsWith('B') ) 
                    durations.push( [ arr[0].replace('S','') ])
                else if ( arr[1].startsWith('tB') )
                    durations[durations.length-1].push( arr[0].replace('S','') )
            }
        })

        notesLine.split('\.big\.').forEach( (el: string, idx: number) => {
            if ( idx > 0 ) {
                chords.push(el.replace(/\$.*$/, '').trim())
            }
        })
        return { durations: _.clone(durations), chords: _.clone(chords) }
    }

    getCurrDurationsInLine( lineIdx: number ) {
        try {
            const notesLines = this.sheet.sections.get(this.currSection)!
            return this.getDurationsInLine( notesLines[lineIdx] )
        }
        catch (err) { console.error(`pushUseSectionLine: ${err}`) }
    }


    pushUseSectionLine(sectionTarget: string, sectionSource: string, lineIdx: number ): ChordsAndDurationsType | undefined {
        let ret: ChordsAndDurationsType | undefined
        try {
            const notesLines = this.sheet.sections.get(sectionSource)?.filter( ln => ln.startsWith('notes ') )!
            const notesLine = notesLines[lineIdx]
            if ( this.debug ) console.debug(`PUSH ${sectionSource}[${lineIdx}] ==> ${sectionTarget}: ${notesLine}`);
            if ( this.debug ) console.debug('---------------------------------')
            // TODO: Remove this check later 
            if ( ! this.sheet.sections.has(sectionTarget) ) this.sheet.sections.set(sectionTarget, [])
            this.sheet.sections.get(sectionTarget)!.push(notesLine)
            ret = this.getDurationsInLine(notesLine)
            // this.sheet.sectionsCP.get(sectionTarget)!.push( this.sheet.sectionsCP.get(sectionSource)![lineIdx])
        }
        catch( err ) {
            console.error(`pushUseSectionLine: ${err}`)
        }
        return ret
    }

    pushNotesOnly( sectionTarget: string, sectionSource: string) {
        const notesLines = this.sheet.sections.get(sectionSource)?.filter( ln => ln.startsWith('notes ') )!
        this.sheet.sections.set(sectionTarget, notesLines)
    }

    pushTextOnly = ( textOnly: string ) => {
        if ( textOnly.length > 0 ) {
            this.sheet.textOnly.get(this.currSection)!.push(textOnly)
        }
    }

    pushTextAndNotes( sectionTarget: string, sectionSource: string) {
        this.sheet.sections.set(sectionTarget, _.clone(this.sheet.sections.get(sectionSource) ) )
    }
    
    pushText = ( textNotes: string[] = [], textParts: string[] = [] ) => {
        let ret = false
        try {
          
            if ( textNotes.length > 0 ) {
                if ( ! this.sheet.sections.has(this.currSection) ) this.sheet.sections.set(this.currSection, [])
                if ( ! this.sheet.sectionsCP.has(this.currSection) ) this.sheet.sectionsCP.set(this.currSection, [])
                
                if ( this.debug ) console.debug(`text ${textNotes.join(' ')} `)
                
                this.sheet.sections.get(this.currSection)!.push('text ' + textNotes.join(' '))
                //
                // Generate the ChordPro text and chords
                //
                const chords: ChordType[] = this.sheet.chords.get(this.currSection)!
                assert( chords !== undefined , `chords for ${this.currSection} must be defined` )
                let chordPro = ""
                let offset = this.currChordPtr > 0 ? ++this.currChordPtr : 0
                let indexMem = 0
                textParts.forEach( ( value, index ) => {
                    indexMem = index
                    assert( index + offset < chords.length, `chords[${index + offset}] is out of range: 0-${chords.length}` )
                    if ( chords[index + offset].chord.startsWith('|') || chords[index + offset].chord.endsWith('|') ) {
                        chordPro += `[${chords[index + offset].chord}]`
                        offset++
                    }
                    chordPro += `[${chords[index + offset].chord}]${value}`
                })

                if ( this.currChordsAndDurations !== undefined ) {
                    const len = this.currChordsAndDurations.chords.length
                    if ( chords.length > textParts.length + offset ) {
                        for( let i = textParts.length + offset; i < len; i++) {
                            chordPro += ` [${chords[i].chord}]`
                        }
                    }
                }
                else {
                    if ( this.debug ) console.debug(`ChordPro CHORD: ${objStringify(chords, undefined,2)}`);
                    if ( chords.length > textParts.length + offset ) {
                        for( let i = textParts.length + offset; i < chords.length; i++) {
                            chordPro += ` [${chords[i].chord}]`
                        }
                    }
                }
                this.sheet.sectionsCP.get(this.currSection)!.push(chordPro)
                this.currChordPtr = indexMem + offset
                ret = true
            }
        }
        catch(err) {
            console.error(err)
        }
        return ret
    }

    finalizeSection = ( sectionName: string, sectionHasContent: boolean) => {
        assert ( this.sheet.sections.has(sectionName), `finalizeSection() cannot find section: ${sectionName}`)
        
        /* TODO: Maybe add this 
        if ( ! sectionHasContent ) {
            if (  this.currUseSection !== '' ) {
                this.sheet.sections.set(sectionName,   _.clone(this.sheet.sections.get(this.currUseSection)!) )
                this.sheet.sectionsCP.set(sectionName, _.clone(this.sheet.sectionsCP.get(this.currUseSection)!) )
                this.sheet.textOnly.set(sectionName,   _.clone(this.sheet.textOnly.get(this.currUseSection)! ) )
            }
            else {
                throw Error(`finalizeSection() Error: no content in section: ${sectionName} and no USE of other section`)
            }
        }
        */ 

        if ( this.sheet.sectionsCP.get( sectionName )!.length === 0 ) {
            let  noteLines: string[] = []
            noteLines = this.sheet.sections.get(sectionName)!.filter( ln => ln.startsWith('notes ') )
            const chordPro: string[] = []
            noteLines.forEach( nl => {
                const entries = nl.split(' ').filter( elem => ( elem.trim().startsWith('$.big.') ||  elem.startsWith('|') ) )
                const chords: string[] = []
                entries.forEach( ent => {
                    if ( ent.startsWith('$.big.') ) {
                        const e = ent.substring( 6, ent.length-1 )
                        chords.push (`[${e}]`)
                    }
                    else if ( ent.startsWith('|') )
                    chords.push ( `[${ent.trim()}]` )
                })
                chordPro.push( chords.join(' ') )
            })
            if ( this.debug ) console.debug(`ChordPro finalized chords: ${chordPro}`)
            this.sheet.sectionsCP.set( sectionName, chordPro )
        }
    }

    render = () => {
        const handled = new Map<string, boolean>()
         // deno-lint-ignore no-explicit-any
        let currElem: any 
        let barNotes:  string[] = []
        // let proNotes:  string[] = []
        let proChords: ChordType[] = []
        let firstChord = true
        let prevChord = 'unset'
        let barsInLastLine = false
        let sectionActive = false
        let sectionHasContent = false
        // this.html = []
        try {
            this.cmds.forEach( (e, i)  => {
                if ( ! handled.has(e.id) ) {
                    currElem = e
                    if ( e.type ===  'NL' ) {     
                            if ( barNotes.length > 0 ) {
                                assert( sectionActive, `Cannot insert notes outside a section`)
                                sectionHasContent = true
                                this.currChordsAndDurations = this.pushNotes(barNotes, proChords)
                                barNotes  = []
                                proChords = []
                                barsInLastLine = true
                                firstChord = true
                                handled.set(e.id, true)
                            }
                        }
                    else if ( e.type === 'TITLE') {  
                            barsInLastLine = false
                            sectionActive = false
                            this.currChordsAndDurations = undefined
                            this.sheet.header.title = e.value
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'AUTHOR' )  {
                            barsInLastLine = false
                            sectionActive = false
                            this.currChordsAndDurations = undefined
                            this.sheet.header.author = e.value
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'KEY' )  {
                            this.sheet.header.key = e.fullKey.join(' ')
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'TEMPO' )  {
                            this.sheet.header.tempo = e.value
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'METER' )  {
                            this.sheet.header.meter = { counter: e.counter, denominator: e.denominator }
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'FORM') {
                            barsInLastLine = false
                            sectionActive = false
                            this.currChordsAndDurations = undefined
                            this.sheet.header.form =  e.formEntries
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'SECTION_HEAD' ||  
                              e.type === 'SECTION') {
                            if ( this.currSection !== '' ) {
                                this.finalizeSection(this.currSection,sectionHasContent)
                            }
                            if ( this.debug ) {
                                console.debug( '------------------------------')
                                console.debug(`NEW SECTION: ${e.value}`)
                            }
                            this.initSection(e.value)
                            barsInLastLine = false
                            sectionActive  = true
                            sectionHasContent = false
                            handled.set(e.id, true)
                        }
                    else if ( e.type === 'BAR' ) {
                                const bar = e.REPEAT_COUNT !== undefined ? '=|:' : '|'
                                const proBar = e.REPEAT_COUNT !== undefined ? '|:' : '|'
                                barNotes.push(bar)
                                proChords.push({ chord: proBar, duration: 0 })
                                handled.set(e.id, true)  
                        }                                    
                    else if ( e.type === 'CHORD_NOTE' ) {
                                const chord = e.fullChord.join('')
                                assert ( e.tie !== undefined, `Missing 'tie' in ${JSON.stringify(e)}`)
                                const comment = ( e.comment !== '' ? ' (' + e.comment + ')' : e.comment).replace(',', ';')
                                // set the chord position
                                const encoding = '$' 
                                let duration = e.duration[0]
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
                                    duration += e.duration[i]
                                    barNotes.push(` :${e.duration[i]}S tB/4 `)
                                }
                                proChords.push({ chord:chord, duration: duration })
                                prevChord = chord
                                handled.set(e.id, true)        
                        }                                                    
                    else if ( e.type === 'REST' ) {
                                let duration = e.duration[0]
                                barNotes.push(`:${e.duration} ${e.tie}##`)
                                // add any tied note lengths
                                for( let i = 1 ; i < e.duration.length; i++ ) {
                                    duration += e.duration[i]
                                    barNotes.push(` :${e.duration[i]}S t## `)
                                }
                                proChords.push({chord: 'R', duration: duration })
                                handled.set(e.id, true) 
                            }                      
                    else if ( e.type === 'SCALE' ) {
                            const len = barNotes.length
                            if ( len === 0 ) {
                                barNotes.push(`[${e.fullScale.join(' ')}]`) 
                            }
                            else {
                                const prevEntry = barNotes[len-1]
                                // If previous entry is a chord entry, merge
                                if ( prevEntry.endsWith('$') ) {
                                    barNotes[len-1] = prevEntry.substring(0, prevEntry.length -1) + ` [${e.fullScale.join(' ')}]$`
                                }
                                else {
                                    barNotes.push(`[${e.fullScale.join(' ')}]`)
                                }
                            }
                            handled.set(e.id, true)
                            }
                    else if ( e.type === 'TEXT_NOTE' ||  e.type === 'TEXT_NOTE2' ) {
                            const len = barNotes.length
                            let note = e.value
                            if ( e.type === 'TEXT_NOTE2' ) {
                                note = `[${e.token}${e.who}: ${e.value}]`
                            }

                            if ( len === 0 ) {
                                barNotes.push(`[${note}]`) 
                            }
                            else {
                                const prevEntry = barNotes[len-1]
                                // If previous entry is a chord entry, merge
                                if ( prevEntry.endsWith('$') ) {
                                    barNotes[len-1] = prevEntry.substring(0, prevEntry.length -1) + ` [${note}]$`
                                }
                                else {
                                    barNotes.push(note)
                                }
                            }
                            handled.set(e.id, true)
                            }
                    else if ( e.type === 'USE' ) {
                            // Check if we should use another section
                            if ( typeof e.value === 'string' ) {
                                assert ( this.sheet.sections.has( e.value) , `USE ${e.value} does not refer to a known Section`)
                                assert (  e.value !== this.currSection , `USE ${e.value} must not be equal to current Section`)
                                assert (  this.sheet.chords.get(e.value) !== undefined , `USE Section ${e.value} must have some actual chords`)
                                if ( this.debug ) console.debug(`USE SECTION: ${e.value} ==> ${this.currSection}`)
                                if ( this.debug ) console.debug(`USE only: ${e.only}`)
                                if ( this.currChordPtr === 0 ) { // Initialize at the beginning of a section
                                    this.currUseSection  = e.value
                                    this.currLineCounter = -1
                                    this.sheet.chords.set( this.currSection, this.sheet.chords.get(this.currUseSection)! )
                                    if (this.debug ) console.debug(`Render for ${this.currSection} is set to: ${e.only}`) 
                                    if ( e.only === 'notesOnly' ) {
                                        this.pushNotesOnly(this.currSection, this.currUseSection)
                                        this.sheet.render.set(this.currSection, 'notesOnly')
                                    }
                                    else if ( e.only === 'textOnly' ) {
                                        this.currUseTextOnly = true
                                        this.sheet.render.set(this.currSection, 'textOnly')
                                    }
                                    else {
                                        this.pushTextAndNotes(this.currSection, this.currUseSection)
                                        this.sheet.render.set(this.currSection, 'textAndNotes')

                                    }
                                }
                            }
                        }
                    else if ( e.type === 'TEXT') {
                            const textParts = []
                            assert( sectionActive, `Cannot insert text aligned with chords outside a section`)

                            // Handle setup for the USE of another section
                            if ( this.currUseSection !== '' ) {    
                                this.currChordsAndDurations = this.pushUseSectionLine(this.currSection, this.currUseSection, ++this.currLineCounter)     
                                // Construct the durations from the USE section
                                e.textDurations = _.clone(this.currChordsAndDurations!.durations)
                            }
                          
                            try {
                                sectionHasContent = ( sectionHasContent || e.textParts.length > 0 )
                                this.pushTextOnly(e.textParts.join(' ').replaceAll('  ', ' '))
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
                                    }
                                    // Add any additional tied durations
                                    for( let j = 1 ; j < e.textDurations[i].length; j++) {
                                        textParts.push(e.textDurations[i][j] )
                                    }
                                }
                            } catch( err) {`Render().durations Error: at ${objStringify(e.textDurations)} \n ${err}` }                                   
                            this.pushText( textParts, e.textParts )
                            handled.set(e.id, true)                                                           
                        }
                    }
            })
        }
        catch(err) {
            console.error(`Render() Error: at ${JSON.stringify(currElem)} - ${err}`)
        }
        if ( barNotes.length > 0 ) {
            this.pushNotes(barNotes, proChords) 
            // this.pushChordPro(this.currSection)
        }
        if ( this.currSection !== '' ) {
            this.finalizeSection(this.currSection,sectionHasContent)
        }
    }
}

export default Vextab