import path from "path";
import cp from "child_process";
import { existsSync } from "fs";
import { Err, Ok, Result } from "ts-results";
import { AuxiliaryStage } from "../types";

const AHK_EXE_PATH = "C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe";
let AHK_EXIST_FLAG: boolean | undefined = undefined;

export function enableAhk() {
  if (AHK_EXIST_FLAG === undefined) {
    AHK_EXIST_FLAG = existsSync(AHK_EXE_PATH);
  }
  return AHK_EXIST_FLAG;
}

export async function runAuxiliary(
  scope: string,
  nepName: string,
  stage: AuxiliaryStage
): Promise<Result<boolean, string>> {
  if (!enableAhk) {
    return new Err("Error:AutoHotKey not installed");
  }
  const auxPath = path.join("auxiliary", scope, nepName, `${stage}.ahk`);
  if (!existsSync(auxPath)) {
    return new Ok(false);
  }
  return new Promise((res) => {
    const cmd = `"${AHK_EXE_PATH}" "${auxPath}"`;
    cp.exec(cmd, (err, _stdout, stderr) => {
      const e = err || stderr;
      if (e) {
        res(
          new Err(
            `Error:Failed to run ${stage} auxiliary script with command '${cmd}'`
          )
        );
      } else {
        res(new Ok(true));
      }
    });
  });
}
