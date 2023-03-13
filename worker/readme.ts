import {Meta, Task} from "../types";
import dayjs from "dayjs";

export interface RenderPicProps {
    picName:string
    shortcutName?:string
}

function renderPics(pics:RenderPicProps[]):string {
    let res=""
    for(const {picName,shortcutName} of pics){
        if(shortcutName){
            res+=`* 运行 \`${shortcutName}\``
        }
        res+=`![shortcutName](${picName})\n`
    }
    return res
}

function genReadme(payload:{
    task:Task,
    shots:{
        afterInstall:string,
        onRun:RenderPicProps[],
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
${renderPics([{picName:afterInstall}])}

## 运行时截图
${renderPics(onRun)}`
}

export {
    genReadme
}