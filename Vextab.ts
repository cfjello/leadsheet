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
    constructor( public cmds: any[], debug = false, _transpose = 0, _sharpFlat = '',  public conf = { 
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
            render: new Map() as RenderSectionType,
            transpose: _transpose,
            sharpFlat: _sharpFlat

        }
        this.debug = debug
        console.debug(`Vextab.constructor() - Transpose: ${this.sheet.transpose}, sharpFlat = ${this.sheet.sharpFlat}`)
    }

    // Transposition: 
    notesSharp = [ "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" , "C" , "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A" ]
    notesFlat  = [ "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" , "C" , "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A" ]

    transpose = (note: string, trans = this.sheet.transpose, sfTarget = this.sheet.sharpFlat ): string  => { 
        assert ( trans > -12 && trans < 12, `vextab.transpose() - transposition: ${trans}  must be in the range: -11 to 11`)
        let ret = note
        let noteIdx = 0
        const sfNote = note.length > 1 ? note.charAt(1) : ''
        if ( sfNote === 'b' ) {
            noteIdx = this.notesFlat.indexOf(note)
        }
        else {
            noteIdx = this.notesSharp.indexOf(note)
        }
        const transIdx = ( (noteIdx + 12 ) + trans ) % 12
        if ( sfTarget === '' ) {
            sfTarget = sfNote === '#' ? sfNote : 'b'
        }
        if ( sfTarget === 'b' ) {
            ret = this.notesFlat[transIdx]
        }
        else if (  sfTarget === '#' ) {
            ret = this.notesSharp[transIdx]
        }
        // console.debug(`transpose: ${trans}, note: ${note}, ret: ${ret}`)
        return ret
     
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
                
                // console.debug(`text ${JSON.stringify(textNotes)} `)
                
                this.sheet.sections.get(this.currSection)!.push('text ' + textNotes.join(' '))
                //
                // Generate the ChordPro text and chords
                //
                const chords: ChordType[] = this.sheet.chords.get(this.currSection)!
                
                if ( this.debug ) {
                    console.debug(`Section: ${this.currSection}, num. of chords and Bars: ${chords.length} `)
                    const chordsArr = chords.filter(e => e.chord !== '|')
                    console.debug(`Section: ${this.currSection}, num. of chords: ${chordsArr.length} `)
                    console.debug(`Section: ${this.currSection}, num. of text parts: ${textParts.length} `)
                }

                assert( chords !== undefined , `chords for ${this.currSection} must be defined` )
                let chordPro = ""
                let offset = 0  // this.currChordPtr > 0 ? ++this.currChordPtr : 0
                let indexMem = 0
                textParts.forEach( ( value, index ) => {
                    // console.debug(`textPart: ${JSON.stringify(value)} `)
                    indexMem = index
                    assert( index + offset < chords.length, `chords[${index + offset}] is out of range: 0-${chords.length} for '${value}'` )
                    if ( chords[index + offset].chord.startsWith('|') || chords[index + offset].chord.endsWith('|') ) {
                        chordPro += `[${chords[index + offset].chord}]`
                        offset++
                    }
                    if ( this.debug ) console.debug(`CHORD: ${chords[index + offset].chord} for: '${value}'`)
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

    render = (transpose = 0, sharpFlat = '' ) => {
        const handled = new Map<string, boolean>()
         // deno-lint-ignore no-explicit-any
        let currElem: any 
        let barNotes:  string[] = []
        // let proNotes:  string[] = []
        let proChords: ChordType[] = []
        let firstChord = true
        let prevChord = 'unset'
        let prevDuration = [] as number[]
        let barsInLastLine = false
        let sectionActive = false
        let sectionHasContent = false
        // this.html = []
        assert( transpose > -12 && transpose < 12, `Illegal transpose value: ${transpose} - must be between -11 and 11.` )
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
                            const transNote = e.fullKey[0]
                            let keyNote =  e.fullKey[0]
                            const sharpFlat = transNote[1] ?? '' 
                            if ( this.sheet.transpose !== 0 || ( sharpFlat !== '' && sharpFlat !== this.sheet.sharpFlat ) ) {
                                keyNote = this.transpose(transNote, this.sheet.transpose)
                            }
                            const key = keyNote + ' ' + e.fullKey.slice(1).join(' ')
                            e.transKey = key
                            this.sheet.header.key = key
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
                            // Handling transposion
                            const sharpFlat = e.sharpFlat ?? ''
                            const transNote = e.value + sharpFlat
                            let chordNote = e.value + sharpFlat
                            let bassIdx = e.fullChord.indexOf('/')
                            let bassNote = bassIdx > 0 ? '/' +  e.fullChord[bassIdx+1] : ''
                            const t = this.sheet.transpose as number
                            if ( t !== 0 || ( sharpFlat !== '' && sharpFlat !== this.sheet.sharpFlat ) ) {
                                chordNote = this.transpose(transNote, t)
                                if ( bassIdx < 0 ) {
                                    bassIdx = e.fullChord.length + 1
                                }
                                else {
                                    bassNote = '/' + this.transpose(e.fullChord[bassIdx+1])
                                }
                            }
                            const chord = chordNote + e.fullChord.slice(transNote.length).join('').replace(/\/.*$/,'') + bassNote;
                            e.transChord = chord
                            // console.debug( `Orig: ${e.fullChord.join('')}, NewChord: ${chord}, newNote: ${chordNote}, t: ${this.sheet.transpose}`)
                            assert ( e.tie !== undefined, `Missing 'tie' in ${JSON.stringify(e)}`)
                            const comment = ( e.comment !== '' ? ' (' + e.comment + ')' : e.comment).replace(',', ';')

                            // set the chord position and duration
                            const encoding = '$' 
                            let duration = e.duration[0]

                            const chordNoBass = chord.replace(/\/[A-G][b#]{0,1}/,'')
                            const prevNoBass = prevChord.replace(/\/[A-G][b#]{0,1}/,'')
                            
                            if ( firstChord ) {
                                barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 ${encoding}.top.${encoding} ${encoding}.big.${chord}${comment}${encoding}`) 
                                firstChord = false
                            }
                            else if ( chord !== prevChord ) {
                                if ( chordNoBass === prevNoBass ) {
                                    const bass = chord.replace(/^[^\/]+/,'')
                                    barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 ${encoding}.big.-${bass}${comment}${encoding}`)
                                }
                                else
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
                            prevDuration = e.duration
                            handled.set(e.id, true)        
                        }
                    else if ( e.type === 'REPEAT_CHORD' ) {
                            assert( prevChord !== 'unset', `A previous chord must exist to use '/' for Repeat Chord`)
                            let duration = prevDuration[0]
                            barNotes.push(`:${duration}S B/4`)
                            // add any tied note lengths
                            for( let i = 1 ; i < prevDuration.length; i++ ) {
                                duration += prevDuration[i]
                                barNotes.push(` :${prevDuration[i]}S tB/4 `)
                            }
                            proChords.push({ chord: prevChord, duration: duration })
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
                            const scaleArr = _.clone(e.fullScale)

                            for ( let i = 0; i < e.fullScale ; i++ ) {
                                let transNote = 'none'
                                if ( i == 0 ) transNote = e.fullScale[i]
                                else if ( e.fullScale[i] === '/' || e.fullScale[i] === ',' ) {
                                    transNote = e.fullScale[++i]
                                }
                                if ( transNote !== 'none' ) {
                                    const sharpFlat = transNote[1] ?? '' 
                                    if ( this.sheet.transpose  !== 0 || ( sharpFlat !== '' && sharpFlat !== this.sheet.sharpFlat ) ) {
                                        scaleArr[i] = this.transpose(transNote)
                                    }
                                }
                            }
                            const scale = scaleArr.join(' ')
                            const len = barNotes.length
                            if ( len === 0 ) {
                                barNotes.push(`[${scale}]`) 
                            }
                            else {
                                const prevEntry = barNotes[len-1]
                                // If previous entry is a chord entry, merge
                                if ( prevEntry.endsWith('$') ) {
                                    barNotes[len-1] = prevEntry.substring(0, prevEntry.length -1) + ` [${scale}]$`
                                }
                                else {
                                    barNotes.push(`[${scale}]`)
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
                                    let text  = e.textParts[i].trim().replace(/,/g, ';')
                                    if ( text === '' ) text = '_'
                                    if ( i == 0 ) {
                                        textParts.push(duration + ',.10,' + text)  
                                        // prevDuration = duration
                                    }
                                    else {
                                        textParts.push(',' + duration + ',' + text) 
                                    }
                                    // Add any additional tied durations
                                    for( let j = 1 ; j < e.textDurations[i].length; j++) {
                                        textParts.push(',:' +  e.textDurations[i][j] + '_' )
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