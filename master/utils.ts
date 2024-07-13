import fs from "fs";
import path from "path";
import { REPORT_DIR } from "./constants";

function mkdir(p: string) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, {
      recursive: true,
    });
  }
}

function getReportDir(scope: string, nepName: string, fileName: string) {
  const p = path.join(REPORT_DIR, scope, nepName, fileName);
  mkdir(p);
  return p;
}

async function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export { getReportDir, sleep };
