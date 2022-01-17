

(function() { 
    let keyMatcher  = /([A-Ga-g][#b]{0,1})/
    let scaleRegexp = /M|major|maj|minor|m|min|dorian|dor|phrygian|phr|lydian|lyd|mixolydian|mixo|mix|aeolian|aeo|locrian|loc/i

    let quaterNoteTicks = 420
    let currBarSize     = 4 * quaterNoteTicks // default
    let currBaseUnit    = quaterNoteTicks
    let currTempo       = 120

    let setMeter = (e) => {
        let [counter, denominator] = e.value.split( '/' )
        e.denominator = denominator
        e.counter = counter
        currBaseUnit = ( ( quaterNoteTicks * 4 ) / denominator ) 
        currBarSize  = currBaseUnit * counter
    }

    let getTicks = ( noteUnit) => {
        return Math.round( (4 * quaterNoteTicks) / noteUnit )
    }

    let evaluate = (cmds) => {

        let res = []

        cmds.forEach( e => {
            switch ( e.type ) {
                case 'TITLE':
                case 'AUTHOR':
                    e.text = e.text.trim()
                    break
                case 'METER': {
                        setMeter(e)
                    }
                    break
                case 'TEMPO' : {
                        if ( e.value < 20 || e.value > 460 )
                            throw Error(`Tempo: ${e.value } is out of range [20-460]`) 
                        else 
                            currTempo = e.value
                    }
                    break
                case 'SCALE': {
                        let [key, scale] = e.value.split( /[\s\-]/ )
                        let k = key.match(keyMatcher)
                        let s = scale.match( scaleRegexp )
                
                        if ( ! k[0] || ! s[0] ) 
                            throw Error(`Invalid key or scale for key: ${k[0]}, and scale: ${s[0]}`)
                        else {
                            e.key   = k[0]
                            e.scale = s[0]
                        }
                    }
                    break  
                case 'GROOVE_ADJUST': {
                        if ( e.value <= 0 || e.value > 240 )
                            throw Error(`Groove adjustment: ${adjustment} is out of range [1-240]`)
                        e.direction = e.text.replace(/[^<>]+/, '')
                    }
                    break
                case 'DURATION': {
                        let adds = [0]
                        if ( e.add ) {
                            e.add.forEach( a => {
                                a.ticks = getTicks(a.value)
                                adds.push(a.ticks)
                            })
                        }
                        let addedTicks = adds.reduce( (prev, curr) => prev += curr ) 
                        let duration = getTicks(e.value)
                        if ( duration + addedTicks <= 0 )
                            throw Error(`Negative or zero duration in ticks at Ln ${e.line},Col ${e.col}: ${duration} and added ${addedTicks}`)
                        else
                            e.ticks = duration + addedTicks 
                    }
                    break
            }
        })  
    }   
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = evaluate;
    } 
    else {
        window.evaluate = evaluate;
    }
})()