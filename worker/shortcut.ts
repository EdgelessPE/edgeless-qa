import fs from "fs";
import cp from "child_process"
import {DESKTOP_LOCATION} from "./constants";
import {Err, Result} from "ts-results";
import {takeShot} from "./network";
import {Task} from "../types";

function getShortcuts():string[] {
    return fs.readdirSync(DESKTOP_LOCATION)
        .filter(name=>name.endsWith(".lnk"))
}

// 返回截图
async function spawnShortcut(p:string,task:Task):Promise<Result<string, string>> {
    return new Promise((resolve)=>{
        const handler=cp.exec(`explorer "${p}"`,async (error) => {
            if (error) {
                resolve(new Err(`Error:Failed to spawn shortcut ${p} : ${JSON.stringify(error)}`))
            } else {
                resolve(await takeShot({name: task.name, category: task.category, stage: "onRun"}))
                handler.kill()
            }
        })
    })
}

export {
    getShortcuts,
    spawnShortcut,
}