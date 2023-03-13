import {Ok, Result} from "ts-results";
import {end, start, takeShot} from "./network";
import {downloadEpt, downloadNep} from "./download";
import {eptInstall, eptUninstall} from "./ept";
import {genMeta} from "./meta";
import {getShortcuts, spawnShortcut} from "./shortcut";
import {EndReq, Task} from "../types";
import {genReadme, RenderPicProps} from "./readme";
import path from "path";

async function runner(task:Task):Promise<EndReq['result']> {
    // 下载测试包
    const {name,category}=task
    const dRes=await downloadNep(task.download,task.category,task.name)
    if(dRes.err) return dRes
    const nepPath=dRes.unwrap()

    // 安装
    await eptUninstall(name.split("_")[0])
    const iRes=await eptInstall(path.join(__dirname,"..",nepPath))
    if(iRes.err) return iRes
    const installedPath=iRes.unwrap()

    // 生成 meta
    const meta=genMeta(installedPath)

    // 截图
    const sRes=await takeShot({name,category,stage:"afterInstall"})
    if(sRes.err) return sRes
    const SNAP_afterInstall=sRes.unwrap()

    // 试运行并截图
    const snapRes=await Promise.all(getShortcuts().map(p=>spawnShortcut(p,task)))
    for(const r of snapRes){
        if(r.res.err){
            return r.res
        }
    }
    const SNAPS_onRun:RenderPicProps[]=snapRes.map(r=>({shortcutName:r.shortcutName,picName:r.res.unwrap()}))

    // 卸载
    const uRes=await eptUninstall(name.split("_")[0])
    if(uRes.err) return uRes

    //TODO:检查新增数据写入meta

    return new Ok({
        readme:genReadme({
            task,
            meta,
            shots:{
                afterInstall:SNAP_afterInstall,
                onRun:SNAPS_onRun
            }
        }),
        meta
    })
}

async function main():Promise<Result<null, string>> {
    // 服务端握手
    const infoOpt=await start()
    if(infoOpt.none) return new Ok(null)
    const info=infoOpt.unwrap()
    const {task}=info
    const {name,category}=task

    // 下载 ept
    if(info.eptDownload){
        const dRes=await downloadEpt(info.eptDownload)
        if(dRes.err) return dRes
    }

    // 执行测试
    const result=await runner(task)

    // 报告
    return end({
        name,
        category,
        result
    })
}

console.log("Info:Start test")
main().then(res=>{
    if(res.err){
        console.log(res.err)
    }else{
        console.log(`Success:Task tested`)
    }
})