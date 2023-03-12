import Downloader from "nodejs-file-downloader"
import {Err, Ok, Result} from "ts-results";
import path from "path";
import fs from "fs";

async function download(url:string,saveToDir:string,saveAsName:string):Promise<Result<null, string>> {
    const target=path.join(saveToDir,saveAsName)
    if(fs.existsSync(target)){
        fs.unlinkSync(target)
    }
    const downloader = new Downloader({
        url,
        directory: saveToDir,
        onBeforeSave: () => {
            return saveAsName
        },
    });
    try {
        await downloader.download();
        return new Ok(null)
    } catch (error) {
        return new Err(`Error:Failed to download '${url}' : ${JSON.stringify(error)}`)
    }
}

async function downloadEpt(url:string) {
    return download(url,"./ept","ept.exe")
}

async function downloadNep(url:string,category:string,name:string) {
    return download(url,path.join("./downloaded",category),name)
}

export {
    downloadEpt,
    downloadNep,
}