import fs from "fs"
import path from "path";
import {Task} from "../types";
import {None, Option, Some} from "ts-results";

function getTasks(storage: string): Task[] {
    const list = fs.readdirSync(storage)
    let res: Task[] = []

    for (const category of list) {
        res = res.concat(
            fs.readdirSync(path.join(storage, category))
                .map(fileName => ({
                    name: fileName,
                    category,
                    download: `/storage/${category}/${fileName}`
                }))
        )
    }

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