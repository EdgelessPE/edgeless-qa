import express from "express"
import bodyParser from "body-parser"
import dayjs from "dayjs";
import {TaskManager} from "./task";
import {PORT, TASK_DIR, VM_SNAPSHOT} from "./constants";
import {EndReq, TakeShotReq} from "../types";
import {shotVM, startVM, stopVM} from "./vm";
import path from "path";
import {Err, Ok, Result} from "ts-results";
import {getReportDir} from "./utils";
import fs from "fs";

const app=express()
const taskManager=new TaskManager(TASK_DIR)

async function beginATask():Promise<Result<null, string>> {
    const get=taskManager.get()
    if(get.some){
        console.log(`Info:Start task ${get.val.name}`)
        return startVM(VM_SNAPSHOT)
    }else{
        console.log(`Info:No tasks left`)
        return new Ok(null)
    }
}

app.use(bodyParser.json())
app.get("/start",(req,res)=>{
    res.json(taskManager.get())
})
app.use('/storage',express.static(TASK_DIR))
app.post('/takeShot',async (req,res)=>{
    const body:TakeShotReq=req.body
    const fileName=`${body.name}_${dayjs().format("YY-MM-DD-HH-mm-ss")}.png`
    const reportDir=getReportDir(body.category,body.name)

    const sRes=await shotVM(path.join(reportDir,fileName))
    res.json(sRes.ok?(new Ok(fileName)):sRes)
})
app.post("/end",async (req,res)=>{
    const body:EndReq=req.body

    // 校验完成的任务 name 是否一致
    const curTask=taskManager.get()
    if(curTask.none||curTask.unwrap().name!==body.name){
        res.json(new Err(`Error:Expect current task to be '${curTask.unwrapOr({name:"NO_TASK"}).name}',got '${body.name}'`))
        return
    }
    const reportDir=getReportDir(body.category,body.name)
    res.json(new Ok(null))

    // 处理失败
    if(body.result.err){
        fs.writeFileSync(path.join(reportDir,"Error.txt"),body.result.val)
        return
    }

    // 保存数据
    const {readme,meta}=body.result.val
    fs.writeFileSync(path.join(reportDir,"README.md"),readme)
    fs.writeFileSync(path.join(reportDir,"meta.json"),JSON.stringify(meta,null,2))

    // 关闭虚拟机
    const sRes=await stopVM()
    if(sRes.err){
        console.error(JSON.stringify(sRes,null,2))
        return
    }

    // 步进任务队列
    if(taskManager.finish()){
        const lRes=await beginATask()
        if(lRes.err){
            console.error(JSON.stringify(lRes,null,2))
            return
        }
    }
})

app.listen(PORT,() => {
    console.log(`Master listening on port ${PORT}`)
    beginATask().then(lRes=>{
        if(lRes.err){
        console.error(JSON.stringify(lRes,null,2))
    }})
})