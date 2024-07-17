import fs from "fs";
import { EPT_DIR } from "./constants";
import path from "path";
import { StdoutShot, Task } from "../types";
import { exec } from "./ept";

function getPaths() {
  const p = path.join(EPT_DIR, "bin");
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p);
}

async function spawnPaths(name: string, task: Task): Promise<StdoutShot> {
  const res = await exec(`cmd /c "${name} help"`, task, {
    cwd: path.join(EPT_DIR, "bin"),
  });
  return {
    pathName: name,
    stdout: res.val,
  };
}

export { getPaths, spawnPaths };
