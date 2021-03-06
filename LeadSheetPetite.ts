import { ArgsObject } from "https://deno.land/x/parlexa@v1.0.3/interfaces.ts";
import { ArgsObjectArray, VextabDefaults, VextabHeaderType, VextabSheetType } from "./interfaces.ts";
import { Templating } from "./Templating.ts";
import { WalkEntryExt } from "./fileWalk.ts";
import { fileWalk } from "./fileWalk.ts";
import { _ } from './lodash.ts';
import { Parser } from "https://deno.land/x/parlexa/mod.ts";
import LR from "./rules/lexerRules.ts";
import PR from "./rules/parserRules.ts";
import align from "./align.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import VextabPetite from "./VextabPetite.ts";

const __dirname = path.dirname( path.fromFileUrl(new URL('./leadsheet', import.meta.url)) )

export class LeadSheetPetite {   
   private _debug = false;
    public get debug() {
        return this._debug
    }
    public set debug(value) {
        this._debug = value
        this.parser.debug = value
    }

    // Data Structures
    songs  = new Map<string, WalkEntryExt>()
    sheets = new Map<string, string>()
    parsed = new Map<string, any>()
    vexed  = new Map<string, VextabSheetType>()
    fileEntries = new Map<string, WalkEntryExt>()
    menuList: ArgsObjectArray = []

    // Parser
    parser = new Parser( LR, PR, 'reset')   

    constructor( public sheetsDir = `${__dirname}/sheets`, public templateDir = `${__dirname}/templates`, public matchPattern = '.txt' , public conf = { 
        quaterNoteTicks:  420, 
        currTicks:        0,
        currBarSize:      4 * 420 ,
        currBaseUnit:     420,
        currTempo:        120,
        currMeter:        { counter: 4, denominator: 4},
    } as VextabDefaults) {}

    // Menu Items
    getMenuItems = ( force = false ): ArgsObject[] => {
        if ( this.menuList.length === 0 || force ) {
            for ( let [ key, entry] of this.fileEntries ) 
                this.menuList.push({ menuItem: entry.name, menuRef: entry.baseName} as ArgsObject)
        }
        return this.menuList
    }

    getMenuItemNames = (): string[] => {
        return Object.keys(this.menuList)
    }

    loadSheetList = (): Map<string,WalkEntryExt> => {
        let entry: WalkEntryExt = {} as WalkEntryExt
        try {
            for (entry of fileWalk(this.sheetsDir, this.matchPattern)) {
                if ( entry.isFile && ! entry.isDirectory ) {
                    this.fileEntries.set(entry.baseName, entry)
                }
            }
        }
        catch( err ) { console.error(`Cannot read file: ${entry} - ${err}`) }
        return this.fileEntries
    }

    // Sheet header
    getHeader(sheetName: string): VextabHeaderType {
        return this.vexed.get(sheetName)!.header
    }

    // Sheet header
    getSheet(sheetName: string): VextabSheetType {
        if ( ! this.vexed.has(sheetName) ) this.renderVextab( sheetName )
        console.log(`getSheet() returns ${sheetName}`)
        console.log(`getSheet() struct ${JSON.stringify(this.vexed.get(sheetName)!)}`)
        return this.vexed.get(sheetName)!
    }

    loadSheet = ( entry: WalkEntryExt, force = false ): string => {
        let sheet = ''
        if ( entry.isFile  && ( ! this.sheets.has(entry.baseName) || force ) ) {
            sheet = Deno.readTextFileSync(entry.path).replace(/\r/mg, '')  
            this.sheets.set( entry.baseName, _.cloneDeep(sheet) )
            sheet = this.sheets.get(entry.baseName)!
        }
        return sheet
    }

    loadAllSheets = (force = false) => {
        if ( this.fileEntries.size === 0 || force ) this.loadSheetList()  
        let currEntry: WalkEntryExt | undefined = undefined 
        try {
            for ( let [key, entry] of this.fileEntries) {
                currEntry = entry
                console.log(`loadAllSheets(): ${JSON.stringify(entry)}`)
                if ( entry.isFile && ! entry.isDirectory ) {
                    const sheet = Deno.readTextFileSync(entry.path).replace(/\r/mg, '')  
                    console.log(`entry.baseName =  ${sheet.substring(0,80)}`)
                    this.sheets.set(entry.baseName, _.cloneDeep(sheet))
                }
            }
        }
        catch( err ) { console.error(`Cannot read file: ${currEntry} - ${err}`) }
    }

    parseSheet( sheetName: string ): boolean {
        let ret = false
        try {
            this.parser = new Parser( LR, PR, 'reset')  
            this.parser.reset(this.sheets.get(sheetName)!)
            const tree = this.parser.getParseTree()
            console.log(`tree =  ${JSON.stringify(tree).substring(0,100)}`)
            align(tree) 
            this.parsed.set(sheetName, _.cloneDeep(tree))
            ret = true
        }
        catch(err) { console.error(err) }
        return ret
    }

    parseAllSheets(): boolean {
        let ret = false
        try {
           for ( const key of this.sheets.keys() ) {
                ret = true
                console.log(`parseKey =  ${key}`)
                this.parseSheet(key)
           }
        }
        catch(err) { console.error(err) }
        return ret
    }

    renderVextab(sheetName: string, force = false) {
        if ( ! this.vexed.has(sheetName) || force ) {
            if ( ! this.parsed.has(sheetName) ) {
                console.log(`Parsing: ${sheetName}`)
                this.parseSheet(sheetName)
            }
            console.log(`Vextab rendering: ${sheetName}`)
            const vextab = new VextabPetite( this.parsed.get(sheetName) )
            vextab.render()
            this.vexed.set( sheetName, _.cloneDeep(vextab.getSheet()) ) 
        }
    }
}
export default LeadSheetPetite