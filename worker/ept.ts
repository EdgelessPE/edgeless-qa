import { Err, Ok, Result } from "ts-results";
import cp from "child_process";
import { log } from "./log";
import { MetaResult } from "../bindings/MetaResult";
import { runAuxiliary } from "./ahk";
import { sleep } from "./utils";
import { AuxiliaryStage, Task } from "../types";

async function exec(
  cmd: string,
  { scope, nepName }: Task,
  {
    cwd,
    timeoutIsOk,
    stage,
  }: {
    cwd?: string;
    timeoutIsOk?: boolean;
    stage?: AuxiliaryStage;
  }
): Promise<Result<string, string>> {
  const start = Date.now();
  return new Promise(async (resolve) => {
    setTimeout(() => {
      const cons = timeoutIsOk ? Ok : Err;
      resolve(new cons("Execution timeout"));
    }, (timeoutIsOk ? 1 : 3) * 60000);
    // 执行 ept 命令
    cp.exec(cmd, { cwd }, (error, stdout, stderr) => {
      const passed = (Date.now() - start) / 1000;
      log(
        `Info:Command '${cmd}' executed in ${passed.toFixed(1)}s (${(
          passed / 60
        ).toFixed(1)}min)`
      );
      const e = error ?? stderr;
      if (e) {
        resolve(new Err(`Error:Failed to exec cmd '${cmd}' : ${e}`));
      } else {
        resolve(new Ok(stdout));
      }
    });
    if (stage) {
      // 运行辅助脚本
      await sleep(10000);
      const auxRes = await runAuxiliary(scope, nepName, stage);
      if (auxRes.err) {
        resolve(auxRes);
      } else {
        if (auxRes.unwrap()) {
          log("Info:Auxiliary script executed successfully");
        }
      }
    }
  });
}

async function eptInstall(
  pkg: string,
  task: Task
): Promise<Result<string, string>> {
  return exec(`ept --qa install "${pkg}"`, task, {
    cwd: "./ept",
    stage: "install",
  });
}

async function eptUninstall(
  name: string,
  task: Task
): Promise<Result<string, string>> {
  return exec(`ept --qa uninstall "${name}"`, task, {
    cwd: "./ept",
    stage: "uninstall",
    timeoutIsOk: true,
  });
}

async function eptMeta(
  name: string,
  task: Task
): Promise<Result<MetaResult, string>> {
  const res = await exec(`ept meta "${name}"`, task, {
    cwd: "./ept",
  });
  if (res.err) return res;
  try {
    const validJsonStartIndex = res.val.indexOf("{");
    const jsonBody = res.val.slice(validJsonStartIndex);
    return new Ok(JSON.parse(jsonBody));
  } catch (e) {
    return new Err(
      `Error:Failed to parse output as meta : ${e}, output : ${res.val}`
    );
  }
}

export { eptInstall, eptUninstall, eptMeta, exec };
