import {Err, Ok, Result} from "ts-results";
import cp from "child_process";
import path from "path";

async function exec(cmd:string,cwd?:string):Promise<Result<null, string>> {
    return new Promise((resolve)=>{
        cp.exec(cmd,{cwd},(error, stdout)=>{
            if(error){
                resolve(new Err(`Error:Failed to exec cmd '${cmd}' : ${stdout}`))
            }else{
                resolve(new Ok(null))
            }
        })
    })
}

async function eptInstall(pkg:string):Promise<Result<string, string>> {
    const res=await exec(`ept install "${pkg}"`,"./ept")
    if(res.err) return res
    return new Ok(path.join("./ept","apps",path.basename(pkg)))
}

async function eptUninstall(name:string):Promise<Result<null, string>> {
    return exec(`ept uninstall "${name}"`,"./ept")
}

export {
    eptInstall,
    eptUninstall,
}