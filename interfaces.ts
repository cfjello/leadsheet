/*
Sheet: 
    header: 
        title:  string, 
        author: string,
        form:   sorted Map<string>
    sorted Map of Section:
        sectionName: string,
        Array of StaffSystem: 
            Array of Staff:
                Shared Aspects:  
                    RealTime: int     // Running total 
                    Duration: int     // calculated
                    Parser Reference: LUID
                Array of Bar: 
                Array of BarEvents :  
                    Mixed Array of:  
                            Chord: 
                                Note: {...}
                            | 
                            Note: "./Chord.Note"
                            | 
                            Inline: { ... }
                            | 
                            TextNote: { ... }
                    |
                    Array of TextType
                | 
                Array of Lyrics 
*/ 

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

export type VextabHeaderType = { 
  title:    string,
  author:   string,
  tempo:    number,
  meter:    { counter: number, denominator: number},
  form:     string[],
} 

export type VextabSectionType = Map<string, string[]>

export type VextabSectionArrType  = { name: string, value: string[]}
// export type VextabSectionRestType = VextabSectionArrType[]

export type VextabSheetType = {
  header:   VextabHeaderType, 
  sections: VextabSectionType
}

export type VextabRestSheetType = {
  header:   VextabHeaderType, 
  sections: VextabSectionArrType[]
}

export type ChordOrNoteType = {
  type: 'chord' | 'note'
  // deno-lint-ignore no-explicit-any
  entry: any,
  duration:    number,
}



/* Type fiddling
export let  ChordOrNoteFac = () => {
    let t: string = 'chord' 
    let v: string
    // let i: boolean = false
    return {
        set(value: string ): void {
            t = value
        },
        get() {
            return t
        },
        type( value: string === '') {

            if ( value !== '' ) {
                t = value
            }
            return t
        }
    }
}

                                  // 'chord' | 'note'
  // deno-lint-ignore no-explicit-any
  entry: any
  duration:    number
}
*/ 

export type InlineType = {
  type: 'tempo' | 'meter' | 'key'
  // deno-lint-ignore no-explicit-any
  entry: any,
  duration:    number,
}

export type TextType = {
  value: string
  // deno-lint-ignore no-explicit-any
  entry: any,
  duration:    number,
}

export type BarEventsType = ChordOrNoteType | InlineType | TextType

export type BarType = {
  value: string
  // deno-lint-ignore no-explicit-any
  entry: any,
  repeats: number,
  span:    number,
  events: BarEventsType[]
}

export type StaffType = BarType | TextType
export type StaffEventsType = StaffType[]
export type StaffSystemLines = StaffEventsType[]

export type SectionType = {
  name: string,
  // deno-lint-ignore no-explicit-any
  entry: any
  staff: StaffSystemLines
}

export interface ArgsObject {
  [key: string]: string
}

export type ArgsObjectArray = ArgsObject[]

interface VextabRendering {
    header: string[], notes: string[], text: string[]
}


/*
export type sheetType =  {
    header: HeaderType,
    section: SectionType
}
*/