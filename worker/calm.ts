import Clam from "clamscan";
import { Err, Ok, Result } from "ts-results";
import { log } from "./log";
const ClamScan = new Clam().init({});

export async function scan(dir:string):Promise<Result<string[],string>>{
    const scanner=await ClamScan
    try{
        const version=await scanner.getVersion()
        log(`Info:Start scanning with ClamAV ${version}`)
        const {badFiles}=await scanner.scanDir(dir)
        return new Ok(badFiles)
    }catch(e){
        return new Err(`Error:Failed to scan dir with CalmAV : ${e}`)
    }
}
