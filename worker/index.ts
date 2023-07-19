import {Err, Ok, Result} from "ts-results";
import {end, start, takeShot} from "./network";
import {downloadEpt, downloadNep} from "./download";
import {eptInstall, eptMeta, eptUninstall} from "./ept";
import {getShortcuts, spawnShortcut} from "./shortcut";
import {EndReq, Meta, StdoutShot, Task} from "../types";
import {genReadme, RenderPicProps} from "./readme";
import path from "path";
import {giantCompare, giantScanner} from "./appdata";
import {genInstalledMeta, genUninstalledMeta} from "./meta";
import {log} from "./log";
import {getPaths, spawnPaths} from "./path";
import { scan } from "./calm";

async function runner(task:Task):Promise<EndReq['result']> {
    // 下载测试包
    const {name,category}=task
    log("Info:Downloading package")
    const dRes=await downloadNep(task.download,task.category,task.name)
    if(dRes.err) return dRes
    const nepPath=dRes.unwrap()
    const pureName=name.split("_")[0]

    // 生成 appdata 快照
    const installedAppdataShot=giantScanner()

    // 预卸载
    await eptUninstall(pureName)

    // 安装
    log("Info:Installing")
    const iRes=await eptInstall(path.join(__dirname,"..",nepPath))
    if(iRes.err) return iRes
    const installingConsole=iRes.unwrap()

    // 收集 nep meta
    const nepMetaRes=await eptMeta(pureName)
    if (nepMetaRes.err){
        return nepMetaRes
    }
    const nepMeta=nepMetaRes.unwrap()

    // 生成安装后 meta
    const installedMeta=genInstalledMeta(pureName)

    // 安全扫描
    const badFilesRes=await scan(nepMeta.temp_dir)
    if (badFilesRes.err) return badFilesRes
    const badFiles=badFilesRes.unwrap()
    if(badFiles.length>0){
        return new Err(`Error:Security check failed, the following files are reported to contain viruses by ClamAV : \n${badFiles.join(",")}`)
    }

    // 截图
    log("Info:Shot after installed")
    const sRes=await takeShot({name,category,stage:"afterInstall"})
    if(sRes.err) return sRes
    const SNAP_afterInstall=sRes.unwrap()

    // 试运行并截图
    const SNAPS_onRun:RenderPicProps[]=[]
    for(const name of getShortcuts()){
        const res=await spawnShortcut(name,task)
        if(res.res.err) return res.res
        SNAPS_onRun.push({shortcutName:res.shortcutName,picName:res.res.unwrap()})
    }

    const STDOUTS_onRun:StdoutShot[]=[]
    for(const name of getPaths()){
        const res=await spawnPaths(name.split(".")[0],task)
        STDOUTS_onRun.push(res)
    }

    // 卸载
    log("Info:Uninstalling")
    const uRes=await eptUninstall(pureName)
    if(uRes.err) return uRes

    // 检查 appdata 新增
    const added=giantCompare(installedAppdataShot)

    // 生成 meta
    const meta:Meta={
        installed:installedMeta,
        uninstalled:genUninstalledMeta(nepMeta.temp_dir,added),
        nep:nepMeta
    }

    return new Ok({
        readme:genReadme({
            task,
            meta,
            afterInstall:{
                shot:SNAP_afterInstall,
                console:installingConsole,
            },
            onRun:{
                shots:SNAPS_onRun,
                stdouts:STDOUTS_onRun
            },
            afterUninstall:{
                console:uRes.val
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
        log("Info:Downloading ept")
        const dRes=await downloadEpt(info.eptDownload)
        if(dRes.err) return dRes
    }

    // 执行测试
    const result=await runner(task)

    // 报告
    if(result.err){
        log(result.val)
    }

    return end({
        name,
        category,
        result
    })
}

log("Info:Launching worker...")
main().then(res=>{
    if(res.err){
        log(res.val)
    }else{
        log(`Success:Task tested`)
    }
})
