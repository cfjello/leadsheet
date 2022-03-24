//
// Vextab Rendering
//
export type VextabDefaults = { 
    quaterNoteTicks:  number, 
    currTicks:        number,
    currBarSize:      number,
    currBaseUnit:     number,
    currTempo:        number,
    currMeter:        { counter: number, denominator: number}
} 

export interface ArgsObject {
  [key: string]: string
}

interface VextabRendering {
    header: string[], notes: string[], text: string[]
}
