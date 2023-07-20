import {Err, Ok, Result} from "ts-results";
import cp from "child_process";
import path from "path";
import {log} from "./log";
import {MetaResult} from "../bindings/MetaResult";

async function exec(cmd:string,cwd?:string):Promise<Result<string, string>> {
    const start=Date.now()
    return new Promise((resolve)=>{
        cp.exec(cmd,{cwd},(error, stdout)=>{
            const passed=(Date.now()-start)/1000
            log(`Info:Command '${cmd}' executed in ${passed.toFixed(1)}s (${(passed/60).toFixed(1)}min)`)
            if(error){
                resolve(new Err(`Error:Failed to exec cmd '${cmd}' : ${stdout}`))
            }else{
                resolve(new Ok(stdout))
            }
        })
    })
}

async function eptInstall(pkg:string):Promise<Result<string, string>> {
    return exec(`ept -y install "${pkg}"`,"./ept")
}

async function eptUninstall(name:string):Promise<Result<string, string>> {
    return exec(`ept -y uninstall "${name}"`,"./ept")
}

async function eptMeta(name:string):Promise<Result<MetaResult, string>> {
    const res=await exec(`ept meta "${name}"`,"./ept")
    if(res.err) return res
    try{
        const validJsonStartIndex=res.val.indexOf("{")
        const jsonBody=res.val.slice(validJsonStartIndex)
        return new Ok(JSON.parse(jsonBody))
    }catch (e) {
        return new Err(`Error:Failed to parse output as meta : ${e}, output : ${res.val}`)
    }
}

export {
    eptInstall,
    eptUninstall,
    eptMeta,
    exec,
}
