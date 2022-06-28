import { ArgsObject } from "https://deno.land/x/parlexa@v1.0.3/interfaces.ts";
import { ArgsObjectArray, VextabDefaults } from "./interfaces.ts";
import { decodeTmpl, encodeTmpl, Templating } from "./Templating.ts";
import { WalkEntryExt } from "./fileWalk.ts";
import { fileWalk } from "./fileWalk.ts";
import { Parser } from "https://deno.land/x/parlexa/mod.ts";
import LR from "./rules/lexerRules.ts";
import PR from "./rules/parserRules.ts";
import align from "./align.ts";
import Vextab from "./Vextab.ts";

export class LeadSheet {   
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
    vexed  = new Map<string, Vextab>()

    // Parser & Templating
    parser = new Parser( LR, PR, 'reset')
    tp: Templating     
    
    menuNames: string[] = []
    menuList: ArgsObjectArray = []

    constructor( public sheetsDir = "./sheets", public templateDir = "./templates", public matchPattern = '.txt' , public conf = { 
        quaterNoteTicks:  420, 
        currTicks:        0,
        currBarSize:      4 * 420 ,
        currBaseUnit:     420,
        currTempo:        120,
        currMeter:        { counter: 4, denominator: 4},
    } as VextabDefaults) {
        this.tp = new Templating(this.templateDir, '.tmpl')
        this.tp.addTemplate('H2', '<h2 class="vextitle">§{name}: §{value}</h2>')
        this.tp.addTemplate('H3', '<h3 class="vextitle">§{name}: §{value}</h3>')
        // this.tp.addTemplate('menuItems', '<a href="#" class="list-group-item border-end-0 d-inline-block text-truncate" data-bs-parent="#sidebar"><i class="bi bi-bootstrap"></i> <span>§{menuItem}</span> </a>')
        this.loadAllSheets()
    }

    addMenuItem = ( name: string , href = '#') => {
        this.menuList.push({ menuItem: name, menuRef: href} as ArgsObject)
    }

    getMenuItems = (): string[] => {
        return Object.keys(this.menuList)
    }

    loadSheetList = () => {
        let entry: WalkEntryExt = {} as WalkEntryExt
        try {
            for (entry of fileWalk(this.sheetsDir, this.matchPattern)) {
                if ( entry.isFile && ! entry.isDirectory ) {
                    this.menuNames.push(entry.baseName.replace('.txt', ''))
                    this.addMenuItem(entry.baseName.replace('.txt', ''), entry.baseName) 
                }
            }
        }
        catch( err ) { console.error(`Cannot read file: ${entry} - ${err}`) }
    }

    getHeaderHtml(sheet: string): string {
        return this.vexed.get(sheet)!.getHeader()
    }

    getVextabSheet = ( entry: WalkEntryExt, force = false ): string => {
        let sheet = ''
        if ( entry.isFile  && ( ! this.sheets.has(entry.baseName) || force ) ) {
            sheet = Deno.readTextFileSync(entry.path).replace(/\r/mg, '')  
            this.sheets.set(entry.baseName, sheet)
                this.sheets.set(entry.baseName, sheet)
                this.menuNames.push(entry.baseName.replace('.txt', ''))
                sheet = this.sheets.get(entry.baseName)!
                // this.addMenuItem(entry.baseName.replace('.txt', ''), '#')  //TODO Add the link item
        }
        return sheet
    }

    loadAllSheets = () => {
        let entry: WalkEntryExt = {} as WalkEntryExt
        try {
            for (entry of fileWalk(this.sheetsDir, this.matchPattern)) {
                if ( entry.isFile && ! entry.isDirectory ) {
                    const sheet = Deno.readTextFileSync(entry.path).replace(/\r/mg, '')  
                    this.sheets.set(entry.baseName, sheet)
                    this.menuNames.push(entry.baseName.replace('.txt', ''))
                    this.addMenuItem(entry.baseName.replace('.txt', ''), entry.baseName) 
                }
            }
        }
        catch( err ) { console.error(`Cannot read file: ${entry} - ${err}`) }
    }

    parseSheet( sheet: string ): boolean {
        let ret = false
        try {
            this.parser.reset(this.sheets.get(sheet)!)
            const tree = this.parser.getParseTree()
            align(tree) 
            this.parsed.set(sheet, tree)
            ret = true
        }
        catch(err) { console.error(err) }
        return ret
    }

    renderVextab(sheet: string, force = false) {
        if ( ! this.vexed.has(sheet) || force ) {
            if ( ! this.parsed.has(sheet) ) {
                console.log(`Parsing: ${sheet}`)
                this.parseSheet(sheet)
            }
            console.log(`Vextab rendering: ${sheet}`)
            const vextab = new Vextab( this.parsed.get(sheet), this.tp )
            console.log(vextab.getHtml())
            vextab.render()
            this.vexed.set(sheet, vextab) 
        }
    }


    getMainPage = (sheet = 'Default', force = false): string => {
        const html: string[]        = []
        if ( ! this.vexed.has(sheet) || force ) {
            this.renderVextab(sheet, force)
        }
        const headerHtml = this.vexed.get(sheet)!.getHeader()
        if ( this.debug ) { 
            console.log(`=========================>`)
            console.log(`headerHtml: ${headerHtml}`)
        }
        const vextabHtml = this.vexed.get(sheet)!.getHtml()
        // if ( this.debug ) { console.log(`vextabHtml: ${vextabHtml}`)}

        const menuItemsHtml = this.tp.getTmpl('menuItems', this.menuList, false)
        if ( this.debug ) { 
            console.log(`menuItemsHtml: ${menuItemsHtml}`)
            console.log(`<----------------------------`)
        }
        html.push( 
            this.tp.getTmpl(
                'leadSheet', 
                { 
                    titleHtml:      'Lead Sheet', 
                    headerHtml:     encodeTmpl(headerHtml),
                    menuItemsHtml:  encodeTmpl(menuItemsHtml), 
                    vextabHtml:     encodeTmpl(vextabHtml)
                }
            ) 
        )
        return decodeTmpl(html.join('\n'))
    }
}
export default LeadSheet