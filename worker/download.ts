import Downloader from "nodejs-file-downloader";
import { Err, Ok, Result } from "ts-results";
import path from "path";
import fs from "fs";
import { MASTER_ADDRESS } from "./constants";

async function download(
  url: string,
  saveToDir: string,
  saveAsName: string
): Promise<Result<null, string>> {
  const target = path.join(saveToDir, saveAsName);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
  const downloader = new Downloader({
    url: MASTER_ADDRESS + url,
    directory: saveToDir,
    onBeforeSave: () => {
      return saveAsName;
    },
  });
  try {
    await downloader.download();
    return new Ok(null);
  } catch (error) {
    return new Err(
      `Error:Failed to download '${url}' : ${JSON.stringify(error)}`
    );
  }
}

async function downloadEpt(url: string) {
  return download(url, "./ept", "ept.exe");
}

async function downloadNep(
  url: string,
  scoop: string,
  nepName: string,
  fileName: string
): Promise<Result<string, string>> {
  const res = await download(
    url,
    path.join("./downloaded", scoop, nepName),
    fileName
  );
  if (res.err) return res;
  return new Ok(path.join("./downloaded", scoop, nepName, fileName));
}

export { downloadEpt, downloadNep };
