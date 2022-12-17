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
    // deno-lint-ignore no-explicit-any
    const barGrid: any[][] = []
    barGrid[barLineIdx] = []
    const barLines: number[][] = []
    barLines[barLineIdx] = []
    let currChordsLeft = 1

// deno-lint-ignore no-explicit-any
    const getSubTree = ( startIdx: number, fromParent = false, backStops = [] as string[]): any[] => {
        // deno-lint-ignore no-explicit-any
        const res: any[] = []
        const cmd   = cmds[startIdx]
        const ident = fromParent ? cmd.ident.substring( 0, cmd.ident.lastIndexOf('.') ) : cmd.ident

        for ( let i = startIdx + 1; 
            cmds[i] && cmds[i].ident.substring(0,ident.length) === ident; 
            i++ ) {
                if ( backStops.includes(cmds[i].type) ) 
                    break
                else
                    res.push(cmds[i])
            }
        return res
    }

    const getDefaultDuration = () => {
        const divisor  = Math.trunc( barUnitsLeft / currChordsLeft)
        const duration = Math.trunc( currBarUnits / divisor ) 
        return duration
    }

    const getDuration = (idx: number): { duration: number[], tie: string } => {
        const duration: number[] = []
        const fromParent = true
        const backStops = ['chord', 'CHORD_NOTE']
        const vArr = getSubTree(idx, fromParent, backStops )
                     .filter( v => { 
                        return v.type === 'DURATION' || v.type === 'DURATION2' || v.type === 'DURATION_ADD'
                    })
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
        if ( duration.length === 0 ) {
            const defDur = getDefaultDuration()
            duration.push(defDur)
            // console.debug(`Default Duration: ${defDur}`)
        }
        // console.debug(`{duration: ${duration}, tie: ${tie} }`)
        return { duration: duration, tie: tie }
    }

    const getComment = (idx: number): string => {
        let res = ''
        const vArr = getSubTree(idx).filter( v => { return v.type === 'CHORD_COMMENT' })
        if ( vArr.length > 0 ) res = vArr[0].value
        return res
    }

    // deno-lint-ignore no-explicit-any
    const getFullChord = (chord: any, idx: number): string[] => {
        const fullChord: string[] = []
        fullChord.push(chord.value)
        if ( chord.sharpFlat === '#' ||  chord.sharpFlat === 'b' ) fullChord.push(chord.sharpFlat)
        let goOn = true
        for ( let i = idx + 1; goOn; i++ ) {
            const c =cmds[i]
            if ( ! c.matched || (c.text === 'CHORD_NOTE' || c.text === 'always') && c.type === 'Token') continue
            if ( ['CHORD_TYPE', 'CHORD_REPEAT', 'CHORD_EXT', 'CHORD_EXT2', 'CHORD_BASS', 'CHORD_INVERSION', 'CHORD_MINUS_NOTE'].includes(c.type) )    
                if ( c.type === 'CHORD_BASS' ) 
                    fullChord.push( `/${c.value}`)
                else 
                    fullChord.push(c.value)
            else {
                goOn = false
            }
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
        return chordCount
    }

    cmds.forEach( (e, i)  => {
        if (e.type ===  'BAR') {
            barCount++
            currBarUnits = currMeter.counter * currMeter.denominator
            barUnitsLeft = currBarUnits
            currChordsLeft = getChordsCountInBar(i)
            }
        else if (e.type === 'NL') {
            currBarUnits = currMeter.counter * currMeter.denominator
            barUnitsLeft = currBarUnits
            if ( barLines.length > barLineIdx && barLines[barLineIdx].length > 0  ) { 
                barLineIdx++ 
                barLines[barLineIdx] = []
            }
            }
        else if (e.type === 'METER') {
                currMeter = { counter: e.counter, denominator: e.denominator }
                currBarUnits = currMeter.counter * currMeter.denominator
                }
        else if (e.type === 'TEMPO') {
            if ( e.value < 20 || e.value > 460 ) throw Error(`Tempo: ${e.value } is out of range [20-460]`) 
            currTempo = e.value
            tickPerMin      = currTempo * quaterNoteTicks
            milliSecPerTick = Math.round( 60000 / tickPerMin )
            }   
        else if (e.type === 'FORM') { 
            e.formEntries = getFormEntries(i)
            }
        else if (e.type === 'REST' ||
                 e.type === 'CHORD_NOTE') {
            // Build chord duration
            const durObj = getDuration(i) 
            e.duration = _.cloneDeep(durObj.duration)
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
            }
        else if (e.type === 'TEXT') {
            // Multiple textparts
            const textParts = e.value.replace(/_[ \t]*/g, '_').replace(/[ \t]+/g, ' ').split('_') // .slice(1)
            const idx = barLineIdx - 1
            e.textParts     = _.clone(textParts)
            e.textDurations = barGrid[idx] ? _.clone(barGrid[idx]): []  
            }
        else if (e.type === 'SCALE' ) {
            const fullScale = [] as string[]
            // Get the subtree terminal symbols
            const subTree = getSubTree(i, true)
            subTree.filter( (ent) => { 
                if ( ! ['Token', 'COMMENT', 'NL'].includes(ent.type) ) return ent 
            }).forEach( c => {
                fullScale.push(c.type === 'NOTE_BOTH' ? c.value + c.sharpFlat: c.value )
            })
            cmds[i].fullScale = _.clone(fullScale)
        }
        else if (e.type === 'KEY' ) {
            const fullKey = [] as string[]
            // Get the subtree terminal symbols
            const subTree = getSubTree(i, true)
            subTree.filter( (ent) => { 
                if ( ! ['Token', 'COMMENT', 'NL'].includes(ent.type) ) return ent 
            }).forEach( c => {
                fullKey.push( c.type === 'NOTE_BOTH' ? c.value + c.sharpFlat: c.value )
            })
            cmds[i].fullKey = _.clone(fullKey)
        }
        })
}
export default align