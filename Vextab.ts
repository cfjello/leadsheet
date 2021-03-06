import { VextabDefaults } from "./interfaces.ts"
import { reserved, Templating } from "./Templating.ts";

export class Vextab {

    debug = false
    html: string[] = []
    header: string[] = []

    getHtml = (): string => {
        return this.html.join('\n')
    }

    getHeader = (): string => {
        return this.header.join('\n')
    }

    getSinglePage = (): string => {
        let page = '<html>\n'
        const vextabHeader = this.tp.getTmpl('vebtabHtmlHeader', {})
        page += vextabHeader
        // page += '\n<body class="vexbody">'
        const html = this.getHtml()
        page += '\n' + html
        page += '\n</body></html>'
        return page
    }

    // deno-lint-ignore no-explicit-any
    constructor( public cmds: any[], public tp: Templating, public conf = { 
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

    pushNotes = ( barNotes: string[] = [] ) => {
        let ret = false
        // if text ahead, we should wait 
        /*
        const textAhead = ( this.lookAhead(
            'TEXT',
            idx,
            ['WS','Token','NL'],
            ['SECTION','BAR','TITLE', 'AUTHOR', 'FORM', 'CHORD_NOTE', 'SCALE']
            ) !== undefined )
        */
        if ( barNotes.length > 0 ) {
            const timeSig = `${this.conf.currMeter.counter}/${this.conf.currMeter.denominator}`
            const vextabNotes  = this.tp.getTmpl('vextabOptions', { fontSize: '16', space: '20', timeSig: timeSig, width: '1200', barNotes: 'notes ' + barNotes.join(' ') }) 
            this.html.push(vextabNotes)
            ret = true
        }
        /*
            // const tmplName =  textParts.length > 0 ?  : 'vextabDivHeader2'
            if (this.debug ) console.log(`push NOTES: ${ barNotes.join(' ') }`)
            const timeSig = `${this.conf.currMeter.counter}/${this.conf.currMeter.denominator}`
            const vextabOptions  = this.tp.getTmpl('vextabOptions', { fontSize: '16', space: '20', timeSig: timeSig, width: '1200' }) 
            const vextabDiv =  this.tp.getTmpl(
                'vextabDivHeader', 
                {
                    vextabOptions: vextabOptions, 
                    vextabNotes: 'notes ' + barNotes.join(' '), 
                    vextabText:  textParts.length > 0 ? 'text '  + textParts.join(',') : ''
                } 
            ) 
            this.html.push(vextabDiv)
            ret = true
        }
        */
        return ret
    }
    
    render = () => {
        const handled = new Map<string, boolean>()
         // deno-lint-ignore no-explicit-any
        let currElem: any
        let currSection = ''
        let barNotes:  string[] = []
        let textParts: string[] = []
        let firstBarInSection = true
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
                        case 'NL':      if ( this.pushNotes(barNotes) ) { 
                                            barNotes  = []
                                            textParts = []
                                            barsInLastLine = true
                                            firstChord = true
                                        }
                                        handled.set(e.id, true)
                                        break
                        case 'TITLE':   if ( barsInLastLine ) {
                                            this.html.push( this.tp.getTmpl( 'vextabEndDiv', {name: 'vextab' } ) )     
                                            barsInLastLine = false
                                        } 
                                        this.header.push( this.tp.getTmpl('H2', {name: e.token, value: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'AUTHOR':  if ( barsInLastLine ) {
                                            this.html.push( this.tp.getTmpl( 'vextabEndDiv', {name: 'vextab' } ) )     
                                            barsInLastLine = false
                                        }
                                        this.header.push( this.tp.getTmpl('H3', {name: e.token, value: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'FORM':    {
                                        if ( barsInLastLine ) {
                                            this.html.push( this.tp.getTmpl( 'vextabEndDiv', {name: 'vextab' } ) )     
                                            barsInLastLine = false
                                        }
                                        const listEntries: string[] = []
                                        e.formEntries.forEach( ( entry: string ) => {
                                            listEntries.push( this.tp.getTmpl('formListEntry', {name: entry } ) )
                                        })
                                        this.header.push(this.tp.getTmpl('H3' , { name: 'Form', value: listEntries.join(',') } ) )
                                        handled.set(e.id, true)
                                        break
                                        }
                        case 'SECTION': if ( barsInLastLine ) {
                                            this.html.push( this.tp.getTmpl( 'vextabEndDiv', {} ) )     
                                            barsInLastLine = false
                                            firstBarInSection = true
                                        }
                                        currSection = e.value
                                        this.html.push( this.tp.getTmpl('vextabSection', {name: e.value }) )
                                        handled.set(e.id, true)
                                        break
                        case 'BAR':     if ( ! barsInLastLine && firstBarInSection )  this.html.push( this.tp.getTmpl('vextabDivHeader2', {name: e.value }) )
                                        if ( e.REPEAT_COUNT !== undefined ) 
                                            barNotes.push( '=|:')
                                        else 
                                            barNotes.push( '|')  
                                        firstBarInSection = false
                                        handled.set(e.id, true)                                
                                        break
                        case 'CHORD_NOTE': {
                                        const chord = e.fullChord.join('')
                                        const comment = e.comment !== '' ? ' (' + e.comment + ')' : e.comment
                                        // set the chord position
                                        const encoding = reserved[reserved.indexOf('$') + 1 ]
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
                                        textParts = []
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
                                        /*
                                        if ( this.pushNotes(barNotes, textParts, i ) ) {
                                            barNotes  = []
                                            textParts = []
                                            barsInLastLine = true
                                            firstChord = true
                                        }
                                        */
                                        this.html.push('text ' + textParts.join(',') )
                                        // console.log(`push TEXT: ` + textParts.join(',') )
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
            this.pushNotes(barNotes)
            this.html.push( this.tp.getTmpl( 'vextabEndDiv', {} ) )    
        }
    }
}

export default Vextab