import fs from "fs";
import cp from "child_process"
import {DESKTOP_LOCATION} from "./constants";
import {Result} from "ts-results";
import {takeShot} from "./network";
import {Task} from "../types";

function getShortcuts():string[] {
    const res= fs.readdirSync(DESKTOP_LOCATION)
        .filter(name=>name.toLowerCase().endsWith(".lnk"))
    console.log(`Info:Got shortcuts : ${JSON.stringify(res)}`)
    return res
}

// 返回截图
async function spawnShortcut(p:string,task:Task):Promise<{shortcutName:string,res:Result<string, string>}> {
    return new Promise((resolve)=>{
        cp.exec(`explorer "${p}"`,async () => {
            console.log(`Info:Take shot for ${p}`)
            const res=await takeShot({name: task.name, category: task.category, stage: "onRun"})
            resolve({
                shortcutName:p,
                res
            })
        })
    })
}

export {
    getShortcuts,
    spawnShortcut,
}