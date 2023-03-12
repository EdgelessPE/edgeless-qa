import express from "express"
import multer from "multer";

const PORT=3001
const TASK_DIR="./storage"
const SCREENSHOTS_DIR="./shots"
const REPORT_DIR="./reports"

const app=express()
const upload=multer({dest:SCREENSHOTS_DIR})

app.get("/start",(req,res)=>{
    res.json({
        name:"VSCode_1.75.1.0_Bot.nep",
        download:"/storage/VSCode_1.75.1.0_Bot.nep"
    })
})
app.use('/storage',express.static(TASK_DIR))
app.post('/shots',upload.array('shots'),(req,res)=>{
    res.json(req.files)
})
app.post("/end",(req,res)=>{
    res.json(req)
})

app.listen(PORT,() => {
    console.log(`Master listening on port ${PORT}`)
})