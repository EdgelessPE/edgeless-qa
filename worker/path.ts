import fs from "fs";
import {EPT_DIR} from "./constants";
import path from "path";
import {spawnShortcut} from "./shortcut";
import {Task} from "../types";
import {exec} from "./ept";
import {log} from "./log";
import {takeShot} from "./network";
import {Result} from "ts-results";

function getPaths() {
    const p=path.join(EPT_DIR,"bin")
    if(!fs.existsSync(p)) return []
    return fs.readdirSync(p)
}

async function spawnPaths(name:string,task:Task):Promise<{pathName:string,res:Result<string, string>}> {
    const stdout=await exec(`cmd /c "${name} help"`)
    log(`Info:Take shot for ${name}`)
    const res=await takeShot({name: task.name, category: task.category, stage: "onRun"})
    return {
        pathName:name,
        res
    }
}

export {
    getPaths,
    spawnPaths,
}