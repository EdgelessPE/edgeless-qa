import {Meta, Task} from "../types";
import dayjs from "dayjs";

function renderPics(pics:string[]):string {
    let res=""
    for(const name of pics){
        res+=`![](${name})\n`
    }
    return res
}

function genReadme(payload:{
    task:Task,
    shots:{
        afterInstall:string,
        onRun:string[],
    },
    meta:Meta,
}) {
    const {
        task:{name,category},
        shots:{afterInstall,onRun},
        meta
    }=payload
    const time=dayjs().format("YYYY/MM/DD - HH:mm:ss")

return `# ${name} 测试结果

* 分类：${category}
* 测试时间：${time}
* 测试机：Edgeless QA

## 安装后截图
${renderPics([afterInstall])}

## 运行时截图
${renderPics(onRun)}`
}

export {
    genReadme
}