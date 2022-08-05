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
    const barGrid: any[][] = []
    barGrid[barLineIdx] = []
    const barLines: number[][] = []
    barLines[barLineIdx] = []
    let currChordsLeft = 1

// deno-lint-ignore no-explicit-any
    const getSubTree = ( startIdx: number ): any[] => {
        // deno-lint-ignore no-explicit-any
        const res: any[] = []
        const ident = cmds[startIdx].ident
        for ( let i = startIdx + 1; cmds[i] && cmds[i].ident.substring(0,ident.length) === ident; i++ ) res.push(cmds[i])
        return res
    }

    const getDefaultDuration = () => {
        const divisor  = Math.round( barUnitsLeft / currChordsLeft)
        const duration = Math.round( currBarUnits / divisor )  
        return duration
    }

    const getDuration = (idx: number): { duration: number[], tie: string } => {
        const duration: number[] = []
        const vArr = getSubTree(idx).filter( v => { return v.type === 'DURATION' || v.type === 'DURATION2' || v.type === 'DURATION_ADD'})
        for ( let i = 0 ; i < vArr.length ; i++ ) {
            switch (vArr[i].value ) {
                case 'w' :  duration.push(1); break
                case 'h' :  duration.push(2); break
                case 'q' :  duration.push(4); break
                default:    duration.push(parseInt(vArr[i].value ?? '0'))
            }      
            // dotted notes 
            const dur = duration[duration.length -1]
            for ( let j = 1; vArr[i].dot &&  j <= vArr[i].dot.length ; j++ ) {
                duration.push( dur ** (j * 2) ) 
            }
        }
        const tie = vArr && vArr.length > 0 ? vArr[0].tie : ''
        if ( duration.length === 0 ) duration.push(getDefaultDuration())
        return { duration: duration, tie: tie }
    }

    const getComment = (idx: number): string => {
        let res = ''
        const vArr = getSubTree(idx).filter( v => { return v.type === 'CHORD_COMMENT' })
        if ( vArr.length > 0 ) res = vArr[0].value
        return res
    }

    const getFullChord = (chord: any, idx: number): string[] => {
        const fullChord: string[] = []
        fullChord.push(chord.value)
        if ( chord.sharpFlat === '#' ||  chord.sharpFlat === 'b' ) fullChord.push(chord.sharpFlat)
        let goOn = true
        for ( let i = idx + 1; goOn; i++ ) {
            const c =cmds[i]
            if ( (c.text === 'CHORD_NOTE' || c.text === 'always') && c.type === 'Token') continue
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
        for ( let i = idx + 1; cmds[i] && cmds[i].type !== 'BAR' && cmds[i].type !== 'NL'; i++ ) {
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
                /*
                if ( barGrid.length > barLineIdx && barGrid[barLineIdx].length > 0  ) { 
                    barLineIdx++ 
                    barGrid[barLineIdx] = []
                }
                */
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
                const durObj = getDuration(i) 
                e.duration = _.clone(durObj.duration)
                e.tie = durObj.tie
                barLines[barLineIdx].push(e.duration[0])
                if ( barGrid[barLineIdx] === undefined ) barGrid[barLineIdx] = []
                barGrid[barLineIdx].push(e.duration)
                e.ticks = 0
                for ( const d of barGrid[barLineIdx] ) {
                    e.ticks += Math.round( ( 4 / d ) * quaterNoteTicks )
                }
                e.realTime = milliSecPerTick * e.ticks
                barUnitsLeft -=  ( currBarUnits / e.duration )
                currChordsLeft--
                // Get the full chord 
                e.fullChord = _.clone(getFullChord(e, i))
                e.comment = getComment(i)
                break
                }
            case 'TEXT': {
                const textParts = e.value.replace(/_[ \t]+/g, '_').replace(/[ \t]+/g, ' ').split('_') // .slice(1)
                const idx = barLineIdx - 1
                if ( ! barGrid[idx] || barGrid[idx].length < textParts.length ) {
                    throw Error( `Text alignment Error. Missing chords to match text line underscores, '_': ${e.value}`)
                }
                e.textParts     = _.clone(textParts)
                e.textDurations = _.clone(barGrid[idx])
                break
            }
        }
    })
}
export default align