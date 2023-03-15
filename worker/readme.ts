import {Meta, Task} from "../types";
import dayjs from "dayjs";
import {exportLog} from "./log";

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
    afterInstall:{
        shot:string,
        console:string,
    },
    onRun:{
        shots:RenderPicProps[],
    },
    afterUninstall:{
        console:string,
    },
    meta:Meta,
}) {
    const {
        task:{name,category},
        afterInstall,onRun,afterUninstall,
        meta,
    }=payload
    const time=dayjs().format("YYYY/MM/DD - HH:mm:ss")
    const {installed,uninstalled}=meta

return `# ${name} 测试结果

* 分类：${category}
* 测试时间：${time}
* 测试机：Edgeless QA

## 新增的快捷方式
${installed.shortcutsAdded.map(name=>`* \`${name}\``).join("\n")}

## 新增的 PATH 入口
${installed.pathsAdded.map(name=>`* \`${name}\``).join("\n")}

## 安装时控制台输出
\`\`\`
${afterInstall.console}
\`\`\`

## 安装后截图
${renderPics([{picName:afterInstall.shot}])}

## 运行时截图
${renderPics(onRun.shots)}

## 卸载残留${uninstalled.appRemoved?"":"\n * **app 目录**"}
${uninstalled.appData.map(name=>`* \`${name}\``).join("\n")}

## 卸载时控制台输出
\`\`\`
${afterUninstall.console}
\`\`\`

## Meta
\`\`\`
${JSON.stringify(meta,null,2)}
\`\`\`

## QA日志
\`\`\`
${exportLog()}
\`\`\`

`}

export {
    genReadme
}