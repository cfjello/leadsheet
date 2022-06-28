import { WalkEntry, walkSync } from "https://deno.land/std@0.127.0/fs/mod.ts";

export type WalkEntryExt =  WalkEntry & { baseName: string }
  
  // Async
export function fileWalk( dirPath = '.', matchPattern =''): WalkEntryExt[] {
    const files: WalkEntryExt[] = []
    const doMatching = ( matchPattern.length > 0 )
    let   tmplIdx = 0 
    for (const entry of walkSync(dirPath)) {
        tmplIdx = doMatching ? entry.name.indexOf(matchPattern) : 0
        const baseName = tmplIdx > 0 && ! entry.isDirectory ? 
                         entry.name.substring(0,tmplIdx) : 
                         entry.name.substring(0, entry.name.lastIndexOf('.'))
        const newEntry = entry as WalkEntryExt
        newEntry.baseName = baseName 
        files.push( newEntry )
        // console.log(JSON.stringify(newEntry))
    }
    return files
}