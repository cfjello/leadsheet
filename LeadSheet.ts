// import { ArgsObject } from "https://deno.land/x/parlexa/interfaces.ts";
import { ArgsObject } from "https://deno.land/x/parlexa/interfaces.ts";
import { ArgsObjectArray, VextabDefaults, VextabHeaderType, VextabRestSheetType, VextabSheetType } from "./interfaces.ts";
import { WalkEntryExt } from "./fileWalk.ts";
import { fileWalk } from "./fileWalk.ts";
import { _ } from './lodash.ts';
import { Parser } from "https://deno.land/x/parlexa/mod.ts";
import LR from "./rules/lexerRules.ts";
import PR from "./rules/parserRules.ts";
import align from "./align.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import Vextab from "./Vextab.ts";

const __dirname = Deno.cwd()

export class LeadSheet {   
   private _debug = false
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
    // deno-lint-ignore no-explicit-any
    parsed = new Map<string, any>()
    vexed  = new Map<string, VextabSheetType>()
    fileEntries = new Map<string, WalkEntryExt>()
    menuList: ArgsObjectArray = []

    // Parser
    parser = new Parser( LR, PR, 'reset')   
    currVextab: Vextab | undefined

    constructor( 
        public sheetsDir = `${__dirname}/sheets`, 
        public matchPattern = '.txt' , 
        public conf = { 
        quaterNoteTicks:  420, 
        currTicks:        0,
        currBarSize:      4 * 420 ,
        currBaseUnit:     420,
        currTempo:        120,
        currMeter:        { counter: 4, denominator: 4},
    } as VextabDefaults) {}

    // Menu Items
    getMenuItems = async ( force = false ): Promise<ArgsObject[]> => {
        if ( this.menuList.length === 0 || force ) {
            if ( this.fileEntries.size === 0 ) {
                await this.loadSheetList()
            }
            // deno-lint-ignore no-unused-vars
            for ( const [ key, entry] of this.fileEntries ) 
                this.menuList.push({ menuItem: entry.name, menuRef: entry.baseName} as ArgsObject)
        }
        return Promise.resolve(this.menuList)
    }

    getMenuItemNames = (): string[] => {
        return Object.keys(this.menuList)
    }

    loadSheetList = async (): Promise<Map<string,WalkEntryExt>> => {
        let entry: WalkEntryExt = {} as WalkEntryExt
        try {
            for (entry of await fileWalk(this.sheetsDir, this.matchPattern)) {
                if ( entry.isFile && ! entry.isDirectory && entry.name.endsWith('.txt')) {
                    this.fileEntries.set(entry.baseName, entry)
                }
            }
        }
        catch( err ) { console.error(`Cannot read file: ${entry} - ${err}`) }
        return Promise.resolve(this.fileEntries) 
    }

    // Sheet header
    getHeader(sheetName: string): VextabHeaderType {
        return this.vexed.get(sheetName)!.header
    }

    // Sheet header
    getSheet(sheetName: string): VextabSheetType { 
        this.renderVextab( sheetName )
        return this.vexed.get(sheetName)!
    }


    getRestSheet = async(sheetName: string, transpose = 0, sharpFlat = '', reload = false): Promise<VextabRestSheetType> => {
        // if ( ! this.vexed.has(sheetName) || transpose !== 0 ) 
        await this.renderVextab( sheetName, true, transpose, sharpFlat, reload )
        // const parseTree = this.parsed.get(sheetName)
        // Deno.writeTextFile('./pars.txt',`${JSON.stringify(parseTree, undefined, 2)}`, { append: false} )
        return Promise.resolve( { 
            header:     _.clone(this.vexed.get(sheetName)!.header), 
            sections:   Array.from(this.vexed.get(sheetName)!.sections, ([name, value]) => ({ name, value })), 
            chords:     Array.from(this.vexed.get(sheetName)!.chords, ([name, value]) => ({ name, value })),
            sectionsCP: Array.from(this.vexed.get(sheetName)!.sectionsCP, ([name, value]) => ({ name, value })), 
            textOnly:   Object.fromEntries(this.vexed.get(sheetName)!.textOnly),
            render:     Object.fromEntries(this.vexed.get(sheetName)!.render),
            transpose:  transpose,
            sharpFlat:  sharpFlat
        })
    }

    loadSheet = async ( entry: WalkEntryExt, force = false ): Promise<string> => {
        let sheet = ''
        if ( entry.isFile  && ( ! this.sheets.has(entry.baseName) || force ) ) {
            sheet = (await Deno.readTextFile(entry.path)).replace(/\r/mg, '')  
            this.sheets.set( entry.baseName, _.cloneDeep(sheet) )
            sheet = this.sheets.get(entry.baseName)!
        }
        return Promise.resolve(sheet)
    }

    loadAllSheets = async (force = false): Promise<void> => {
        if ( this.fileEntries.size === 0 || force ) await this.loadSheetList()  
        let currEntry: WalkEntryExt | undefined = undefined 
        try {
            // deno-lint-ignore no-unused-vars
            for ( const [key, entry] of this.fileEntries) {
                currEntry = entry
                if ( entry.isFile && ! entry.isDirectory ) {
                    await Deno.readTextFile(entry.path)
                    .then( file => file.replace(/\r/mg, ''))
                    .then ( sheet =>   this.sheets.set(entry.baseName, _.cloneDeep(sheet)) )
                }
            }
            Promise.resolve()
        }
        catch( err ) { console.error(`Cannot read file: ${currEntry} - ${err}`) }
    }

    loadNamedSheet = async (sheetName: string , fileExt = '.txt'):  Promise<void> => {
        const base = path.basename(this.sheetsDir)
        const filePath = path.normalize(`${__dirname}/${base}/${sheetName}${fileExt}`)
        try {
                await Deno.readTextFile(filePath)
                .then( file => file.replace(/\r/mg, ''))
                .then ( sheet =>   this.sheets.set(sheetName, _.cloneDeep(sheet)) )
                Promise.resolve()
        }
        catch( err ) { console.error(`Cannot read file: ${filePath} - ${err}`) }
    }

    parseSheet = async ( sheetName: string, reload = false ): Promise<boolean> => {
        let ret = false
        try {
            this.parser = new Parser( LR, PR, 'reset')  
            this.parser.debug = this.debug
            if ( reload ) await this.loadNamedSheet(sheetName)
            this.parser.reset(this.sheets.get(sheetName)!)
            const tree = this.parser.getParseTree()
            align(tree) 
            this.parsed.set(sheetName, _.cloneDeep(tree)) 
            ret = true
        }
        catch(err) { console.error(err) }
        return Promise.resolve(ret)
    }

    parseAllSheets = async (): Promise<boolean> => {
        let ret = false
        try {
           for ( const key of this.sheets.keys() ) {
                ret = true
                await this.parseSheet(key)
           }
        }
        catch(err) { console.error(err) }
        return Promise.resolve(ret)
    }

    renderVextab = async (sheetName: string, force = false, transpose = 0, sharpFlat = '', reload = false): Promise<void>  => {
           if ( reload || force  || !this.parsed.has(sheetName) ) { 
                await this.parseSheet(sheetName, reload )
            }
            const vextab = new Vextab( this.parsed.get(sheetName), false, transpose, sharpFlat )
            vextab.render(transpose, sharpFlat )
            this.vexed.set( sheetName, _.cloneDeep(vextab.getSheet()) ) 
            this.currVextab = vextab
        // }
        return Promise.resolve()
    }
}
export default LeadSheet