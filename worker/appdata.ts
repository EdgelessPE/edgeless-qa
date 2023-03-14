import fs from "fs";
import path from "path";
import {LOCATIONS} from "./constants";

interface AppDataNode {
    name:string
    path:string
    set:Set<string>
}

function scanner(p:string):AppDataNode {
    return {
        name:path.basename(p),
        path:p,
        set:new Set(
            fs.readdirSync(p)
                .filter(name=>fs.statSync(path.join(p,name)).isDirectory())
        )
    }
}

function compare(prefix:string,before:Set<string>,after:Set<string>):string[] {
    const res:string[]=[]
    for(const name of after){
        if(!before.has(name)) res.push(`${prefix}/${name}`)
    }
    return res
}

function giantScanner() {
    const p=[
        path.join(LOCATIONS.APPDATA_ROOT,"Roaming"),
        path.join(LOCATIONS.APPDATA_ROOT,"Local"),
        path.join(LOCATIONS.APPDATA_ROOT,"LocalLow"),
        // LOCATIONS.PROGRAM_DATA
    ]
    return p.map(scanner)
}

function giantCompare(before:AppDataNode[]):string[] {
    let res:string[]=[]
    before.forEach(node=>{
        res=res.concat(compare(node.name,node.set,scanner(node.path).set))
    })
    return res
}

export {
    giantScanner,
    giantCompare
}