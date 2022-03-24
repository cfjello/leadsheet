import { lodash as _ } from 'https://deno.land/x/deno_ts_lodash/mod.ts'
// deno-lint-ignore no-explicit-any
export const align = (cmds: any[]) => {


    const quaterNoteTicks = 420
    let currMeter       = { counter: 4, denominator: 4}
    let currTempo       = 120
    let tickPerMin      = currTempo * quaterNoteTicks
    let milliSecPerTick = Math.round( 60000 / tickPerMin)
    let currBarUnits    = currMeter.counter * currMeter.denominator 
    let barUnitsLeft    = currBarUnits
    let barCount        = 0 
 


    // Remember chord durations in barline scope
    let barLineIdx  = 0 
    const barLines: number[][] = []
    barLines[barLineIdx] = []
    
    let currChordsLeft = 1

    const getDefaultDuration = () => {
        const divisor  = Math.round( barUnitsLeft / currChordsLeft)
        const duration = Math.round( currBarUnits / divisor )  
        // console.log(`getDefaultDuration - barUnitsLeft: ${barUnitsLeft}, divisor: ${divisor}, duration: ${duration}`)
        return duration
    }

    const getDuration = (idx: number): number => {
        let duration = getDefaultDuration()
        for ( let i = idx + 1; !( ['CHORD_NOTE', 'CHORD_REPEAT', 'BAR', 'NL', 'REST'].includes(cmds[i].type) ); i++ ) {
            if ( cmds[i].type === 'DURATION' ) {
                duration = cmds[i].value
            }
            else if  ( cmds[i].type === 'DURATION2' ) {       
                switch (cmds[i].value ) {
                    case 'w' :  duration = 1; break
                    case 'h' :  duration = 2; break
                    case 'q' :  duration = 4; break
                    default:    duration = cmds[i].value
                }
            }    
            else if ( cmds[i].type === 'DURATION_ADD') {
                duration += cmds[i].value 
            }
        } 
        return duration
    }

    const getFullChord = (chord_note: string, idx: number): string[] => {
        const fullChord: string[] = []
        fullChord.push(chord_note)
        let goOn = true
        for ( let i = idx + 1; goOn ; i++ ) {
            const c =cmds[i]
            if ( c.text === 'CHORD_NOTE' && c.type === 'Token') continue
            if ( ['CHORD_TYPE', 'CHORD_REPEAT', 'CHORD_EXT', 'CHORD_EXT2', 'CHORD_BASS', 'CHORD_INVERSION', 'CHORD_MINUS_NOTE'].includes(c.type) )    
                if ( c.type === 'CHORD_BASS' ) 
                    fullChord.push( `/${c.value}`)
                else 
                    fullChord.push(c.value)
            else 
                goOn = false
        } 
        return fullChord
    }

    const getFormEntries = (idx: number): string[] => {
        const formEntries: string[] = []
        let goOn = true
        for ( let i = idx + 1; goOn ; i++ ) {
            const c =cmds[i]
            if ( c.type === 'Token' || c.type === 'NL'  ) continue
            if ( c.type === 'LIST_ENTRY' && c.matched )
                formEntries.push(c.value)
            else 
                goOn = false
        } 
        return formEntries
    }

    const getChordsCountInBar = ( idx: number): number => {
        let chordCount = 0
        for ( let i = idx + 1; cmds[i].type !== 'BAR' && cmds[i].type !== 'NL'; i++ ) {
            if ( cmds[i].type === 'CHORD_NOTE' || cmds[i].type === 'REST' || cmds[i].type === 'CHORD_REPEAT') {
                chordCount++
            }
        }
        // currDuration = chordCount === 0 ? 1 : chordCount 
        return chordCount
    }

    cmds.forEach( (e, i)  => {
        switch ( e.type ) { /* falls through */
            case 'BAR' :
                barCount++
                currBarUnits = currMeter.counter * currMeter.denominator
                barUnitsLeft = currBarUnits
                currChordsLeft = getChordsCountInBar(i)
                break
            case 'NL' : 
                currBarUnits = currMeter.counter * currMeter.denominator
                barUnitsLeft = currBarUnits
                if ( barLines.length > barLineIdx && barLines[barLineIdx].length > 0  ) { 
                    barLineIdx++ 
                    barLines[barLineIdx] = []
                }
                break
            case 'METER':
                currMeter = { counter: e.counter, denominator: e.denominator }
                currBarUnits = currMeter.counter * currMeter.denominator
                break
            case 'TEMPO' : {
                if ( e.value < 20 || e.value > 460 )
                    throw Error(`Tempo: ${e.value } is out of range [20-460]`) 
                else 
                    currTempo = e.value
                    tickPerMin      = currTempo * quaterNoteTicks
                    milliSecPerTick = Math.round( 60000 / tickPerMin)
                break
                }
            case 'FORM': {
                e.formEntries = getFormEntries(i)
                break
                } 
            case 'REST':
            case 'CHORD_NOTE': {
                // Build chord duration
                e.duration = getDuration(i)
                barLines[barLineIdx].push(e.duration)
                e.ticks = Math.round( ( 4 / e.duration) * quaterNoteTicks )
                e.realTime = milliSecPerTick * e.ticks
                barUnitsLeft -=  ( currBarUnits / e.duration )
                // console.log( `DURATION for ${e.value}: ${e.duration}, ${currChordsLeft}`)
                currChordsLeft--
                // Get the full chord 
                e.fullChord = getFullChord(e.value, i)
                break
                }
            case 'TEXT': {
                const textParts = e.value.replace(/_[ \t]+/g, '_').replace(/[ \t]+/g, ' ').split('_').slice(1)
                const idx = barLineIdx - 1
                if ( ! barLines[idx] || barLines[idx].length < textParts.length ) {
                    throw Error( `Text alignment Error. Missing chords: ${barLines[idx].join(',')} to match text line: ${e.value}`)
                }
                e.textParts     = _.clone(textParts)
                e.textDurations = _.clone(barLines[idx])
                break
            }
        }
    })
}
export default align