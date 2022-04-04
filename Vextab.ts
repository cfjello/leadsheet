import { VextabDefaults } from "./interfaces.ts"
import { getTmpl } from "./templates.ts";

let debug = true

export class Vextab {

    html: string[] = []

    getHtml = (): string => {
        return this.html.join('\n')
    }

    getSinglePage = (): string => {
        let page = '<html>\n'
        const vextabHeader = getTmpl('vebtabHtmlHeader', {})
        page += vextabHeader
        // page += '\n<body class="vexbody">'
        const html = this.getHtml()
        page += '\n' + html
        page += '\n</body></html>'
        return page
    }

    // deno-lint-ignore no-explicit-any
    constructor( public cmds: any[], public conf = { 
        quaterNoteTicks:  420, 
        currTicks:        0,
        currBarSize:      4 * 420 ,
        currBaseUnit:     420,
        currTempo:        120,
        currMeter:        { counter: 4, denominator: 4},
    } as VextabDefaults) {}

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

    render = () => {
        const handled = new Map<string, boolean>()
        let currElem: any
        let barNotes: string[] = []
        let firstChord = true
        let prevChord = 'unset'
        let barText: string[] = []
        let barsInLastLine = false
        this.html = []
        try {
            this.cmds.forEach( (e, i)  => {
                if ( ! handled.has(e.id) ) {
                    currElem = e
                    switch ( e.type ) {
                        case 'NL':      if ( barNotes.length > 0 ) {
                                            if (debug ) console.log(`push NOTES: ${ barNotes.join(' ') }`)
                                            this.html.push('notes ' + barNotes.join(' '))
                                            barNotes = []
                                            barsInLastLine = true
                                            firstChord = true
                                        }
                                        if ( barText.length > 0 ) {
                                            this.html.push('text ' + barText.join(' '))
                                            barText  = []
                                        }
                                        handled.set(e.id, true)
                                        break
                        case 'TITLE':   this.html.push( getTmpl('H1', {name: e.token, value: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'AUTHOR':  this.html.push( getTmpl('H2', {name: e.token, value: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'FORM':    {
                                        const listEntries: string[] = []
                                        // this.html.push( getTmpl('FORM', {name: e.token }) )  
                                        e.formEntries.forEach( ( entry: string ) => {
                                            listEntries.push( getTmpl('LIST_ENTRY', {name: entry } ) )
                                        })
                                        this.html.push(getTmpl('H2' , { name: 'Form', value: listEntries.join(',') } ) )
                                        // this.html.push( getTmpl('FORM_END', {}) )
                                        handled.set(e.id, true)
                                        break
                                        }
                        case 'SECTION': if ( barsInLastLine ) {
                                            this.html.push( getTmpl( 'vextabEndDiv', {name: 'vextab' } ) )     
                                            barsInLastLine = false
                                        }
                                        this.html.push( getTmpl('SECTION', {name: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'BAR':     if ( this.newBarLine(i) ) {
                                            if ( ! barsInLastLine ) {
                                                this.html.push( getTmpl('vextabDivHeader', {}) )
                                                barsInLastLine = false
                                            }
                                            const timeSig = `${this.conf.currMeter.counter}/${this.conf.currMeter.denominator}`
                                            this.html.push( getTmpl('vextabHeader', { fontSize: '16', space: '20', timeSig: timeSig, width: '1200' }) )
                                        }
                                        if ( e.REPEAT_COUNT !== undefined ) 
                                            barNotes.push( '=|:')
                                        else 
                                            barNotes.push( '|')  
                                        handled.set(e.id, true)                                
                                        break
                        case 'CHORD_NOTE': {
                                        const chord = e.fullChord.join('')
                                        const comment = e.comment !== '' ? ' (' + e.comment + ')' : e.comment
                                        // set the chord position
                                        if ( firstChord ) {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 $.top.$ $.big.${chord}${comment}$`) 
                                            firstChord = false
                                        }
                                        else if ( chord !== prevChord ) {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4 $.big.${chord}${comment}$`)
                                        } 
                                        else {
                                            barNotes.push(`:${e.duration[0]}S ${e.tie}B/4`)
                                        }
                                        // add any tied note lengths
                                        for( let i = 1 ; i < e.duration.length; i++ ) {
                                            barNotes.push(` :${e.duration[i]}S tB/4 `)
                                        }
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
                                        handled.set(e.id, true)
                                        break
                                        }
                        /*
                        case 'SCALE':    {
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
                                                    textParts.push(duration + ',' + text) 
                                                else 
                                                    textParts.push(duration) 
                                                // prevDuration = duration
                                            }
                                            // Add any additional tied durations
                                            for( let j = 1 ; j < e.textDurations[i].length; j++) {
                                                textParts.push(e.textDurations[i][j] )
                                            }
                                        }
                                        this.html.push('text ' + textParts.join(',') )
                                        console.log(`push TEXT: ` + textParts.join(',') )
                                        handled.set(e.id, true)                                                            
                                        break
                                        }
                    }
                }
            })

            if ( barNotes.length > 0 ) {
                this.html.push('notes ' + barNotes.join(' '))
            }
        }
        catch(err) {
            console.log(`Error: at ${JSON.stringify(currElem)} - ${err}`)
        }
        if ( barsInLastLine || barNotes.length > 0 || barText.length > 0 ) {
            if ( barNotes.length > 0 ) {
                this.html.push('notes ' + barNotes.join(' '))
            }
            if ( barText.length > 0 ) {
                this.html.push('text ' + barText.join(' '))
            }
            this.html.push( getTmpl( 'vextabEndDiv', {name: 'vextab' } ) )
        }
        // return this.html.join('\n')
    }

    /*
    writeVextab( vexRend: VextabRendering, _outPath: string = "") {
        var vextabOutPath = _outPath.match(/^$/) ? getOutFilePath(_outPath): normalizePath(_outPath)
        // Note that the output is simply an array of byte values.  writeFileSync wants a buffer, so this will convert accordingly.
        // Using native Javascript arrays makes the code portable to the browser or non-node environments
        var outputBuffer = new Buffer( stringify(vexRend, { space: '  ' }) )  
        // Write to a new MIDI file.  it should match the original
        fs.writeFileSync(vextabOutPath, outputBuffer)
    }
    */
}

export default Vextab