import fs from "fs";
import path from "path";
import {REPORT_DIR} from "./constants";

function mkdir(p:string) {
    if(!fs.existsSync(p)){
        fs.mkdirSync(p,{
            recursive:true
        })
    }
}

function getReportDir(category:string,name:string){
    const p=path.join(REPORT_DIR,category,name)
    mkdir(p)
    return p
}

export {
    getReportDir
}