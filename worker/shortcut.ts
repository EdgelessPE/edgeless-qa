import fs from "fs";
import cp from "child_process"
import {LOCATIONS} from "./constants";
import {Result} from "ts-results";
import {takeShot} from "./network";
import {Task} from "../types";

function getShortcuts():string[] {
    let res:string[]=[]
    const p=[LOCATIONS.DESKTOP,LOCATIONS.PUBLIC_DESKTOP]
    p.forEach(location=>{
        res=res.concat(
            fs.readdirSync(location)
                .filter(name=>name.toLowerCase().endsWith(".lnk"))
        )
    })
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