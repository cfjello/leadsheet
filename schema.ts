
class  Int {
    
    checks: Function[] = []
    convs:  Function[] = []
    
    private _value: number;

    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        if ( this.validate(value) )
            this._value = value
        else
            throw Error( `Value: ${value} is not an Int`)
    }


    addCheck( ) {
        
    }

    validate = (value: number): boolean {
        // run through checks 
        // range check
        return Number.isInteger(value) && Number.isSafeInteger(value)    
    }


    toString = () => this.value.toString()
    toNumber = () => (this.value).valueOf() 

    convert = ( to: Function) => {
        // run through member methods 

    }
    
    constructor( value: number ) {
        this.value = value
    }
}

/*
LeadSheet: {
	Defaults: {
Tempo: int,
		Meter: { counter: int, denominator: int },
		Key: {note: string, flatSharp: string, mode: ‘major’ | ‘minor’ }
		TickPerQuoterNote: integer
	},
	Header: {
		Title: string,
		Tempo: int,
		Meter: { counter: int, denominator: int },
		Key: {note: char, SharpFlat: char, mode: ‘major’ | ‘minor’ }
	}
	Section {
		Staffs: {
			Staff: {
				Bars: { 
Events: [  
					InlineEvent:  Meter | Tempo | Key | Accidental
					|  ChordEvent {
						Note: char,
						SharpFlat: char,
						MajorMinor: string,
						Extensions: string[ ]
						Duration: number,
						Tick: int,
						RealTime: integer
					}
|  noteEvent { 
Note: char,
						SharpFlat: char,
						MajorMinor: string,
						Extensions: string[ ]
						Duration: number,
						Tick: int,
						RealTime: integer

}	
					] as barEvents
		
				}
			}
		
		
	}
}
*/