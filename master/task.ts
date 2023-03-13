import fs from "fs"
import path from "path";
import {Task} from "../types";
import {None, Option, Some} from "ts-results";
import {REPORT_DIR} from "./constants";

function getTasks(storage: string): Task[] {
    const list = fs.readdirSync(storage)
    let res: Task[] = []

    for (const category of list) {
        const cateDir=path.join(storage, category)
        if(fs.statSync(cateDir).isFile()) continue
        res = res.concat(
            fs.readdirSync(cateDir)
                .filter(fileName=> {
                    const reportDir=path.join(REPORT_DIR, category, fileName)
                    const done=fs.existsSync(path.join(reportDir,"Error.txt"))||fs.existsSync(path.join(reportDir,"README.md"))
                    return !done
                })
                .map(fileName => ({
                    name: fileName,
                    category,
                    download: `/storage/${category}/${fileName}`
                }))
        )
    }

    console.log(`Info:Got ${res.length} tasks`)
    return res
}

export class TaskManager {
    tasks:Task[]
    index:number
    constructor(storage: string) {
        this.tasks=getTasks(storage)
        this.index=0
    }
    get():Option<Task>{
        const {index,tasks}=this
        if(index<tasks.length){
            return new Some(tasks[index])
        }else{
            return None
        }
    }
    finish(){
        console.log(`Info:Finish task ${this.index}`)
        this.index++
        return this.index<this.tasks.length
    }
}