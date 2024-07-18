import fs from "fs";
import path from "path";
import { REPORT_DIR, TIMEOUT } from "./constants";

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

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useTimeout(onTimeout: (times: number) => void) {
  let timestamp = Date.now();
  let times = 0;

  setInterval(() => {
    if (Date.now() - timestamp > TIMEOUT) {
      times++;
      timestamp = Date.now();
      onTimeout(times);
    }
  }, 60 * 1000);

  const refresh = () => {
    times = 0;
    timestamp = Date.now();
  };

  return { refresh };
}

export { getReportDir, sleep };
