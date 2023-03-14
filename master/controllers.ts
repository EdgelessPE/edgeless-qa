import {Err, None, Ok, Option, Result, Some} from "ts-results";
import {EndReq, StartRes, TakeShotReq} from "../types";
import {TaskManager} from "./task";
import fs from "fs";
import path from "path";
import {EPT_BIN, VM_SNAPSHOT} from "./constants";
import dayjs from "dayjs";
import {getReportDir} from "./utils";
import {shotVM, startVM, stopVM} from "./vm";


async function beginATask(taskManager:TaskManager):Promise<Result<null, string>> {
    const get=taskManager.get()
    if(get.some){
        console.log(`Info:Start task ${get.val.name}`)
        return startVM(VM_SNAPSHOT)
    }else{
        console.log(`Info:No tasks left`)
        return new Ok(null)
    }
}


async function start(taskManager:TaskManager):Promise<Option<StartRes>> {
    const opt=taskManager.get()

    if(opt.some){
        return new Some({
            task:opt.unwrap(),
            eptDownload:fs.existsSync(path.join("storage",EPT_BIN))?`/storage/${EPT_BIN}`:undefined
        })
    }else{
        return None
    }
}

async function takeShot(body:TakeShotReq):Promise<Result<string, string>> {
    const fileName=`${body.stage}_${dayjs().format("YY-MM-DD-HH-mm-ss")}.png`
    const reportDir=getReportDir(body.category,body.name)

    const sRes=await shotVM(path.join(reportDir,fileName))
    return (sRes.ok?(new Ok(fileName)):sRes)
}

async function end(body:EndReq,taskManager:TaskManager):Promise<Result<null, string>> {
    // 校验完成的任务 name 是否一致
    const curTask=taskManager.get()
    if(curTask.none||curTask.unwrap().name!==body.name){
        return new Err(`Error:Expect current task to be '${curTask.unwrapOr({name:"NO_TASK"}).name}',got '${body.name}'`)
    }
    const reportDir=getReportDir(body.category,body.name)

    // 保存数据
    const {result}=body
    if(result.err){
        // 处理失败
        fs.writeFileSync(path.join(reportDir,"Error.txt"),result.val)
        console.log(`Error:Worker returned failure : ${result.val}`)
    }else{
        // 处理成功
        const {readme,meta}=result.val
        fs.writeFileSync(path.join(reportDir,"README.md"),readme)
        fs.writeFileSync(path.join(reportDir,"meta.json"),JSON.stringify(meta,null,2))
    }

    // 关闭虚拟机
    const sRes=await stopVM()
    if(sRes.err){
        console.log(`Error:Failed to shutdown VM : ${JSON.stringify(sRes.val,null,2)}`)
        return new Ok(null)
    }

    // 步进任务队列
    if(taskManager.finish()){
        console.log("Info:Next")
        const lRes=await beginATask(taskManager)
        if(lRes.err){
            console.log(`Error:Failed to begin another task : ${JSON.stringify(lRes.val,null,2)}`)
            return new Ok(null)
        }
    }else{
        console.log("Info:End")
        process.exit(0)
    }

    return new Ok(null)
}

export {
    beginATask,
    start,
    takeShot,
    end
}