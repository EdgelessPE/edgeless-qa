import express from "express"
import bodyParser from "body-parser"
import {TaskManager} from "./task";
import {PORT, TASK_DIR} from "./constants";
import {EndReq, TakeShotReq} from "../types";
import {beginATask, end, start, takeShot} from "./controllers";

const app=express()
const taskManager=new TaskManager(TASK_DIR)

app.use(bodyParser.json())
app.get("/start",(req,res)=>{
    start(taskManager).then(res.json)
})
app.use('/storage',express.static(TASK_DIR))
app.post('/takeShot',(req,res)=>{
    const body:TakeShotReq=req.body
    takeShot(body).then(res.json)
})
app.post("/end",async (req,res)=>{
    const body:EndReq=req.body
    end(body,taskManager).then(res.json)
})

app.listen(PORT,() => {
    console.log(`Master listening on port ${PORT}`)
    beginATask(taskManager).then(lRes=>{
        if(lRes.err){
        console.error(JSON.stringify(lRes,null,2))
    }})
})