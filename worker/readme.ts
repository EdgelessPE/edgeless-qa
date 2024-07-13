import { Meta, StdoutShot, Task } from "../types";
import dayjs from "dayjs";
import { exportLog } from "./log";

export interface RenderPicProps {
  picName: string;
  shortcutName?: string;
}

function renderPics(pics: RenderPicProps[]): string {
  let res = "";
  for (const { picName, shortcutName } of pics) {
    if (shortcutName) {
      res += `* 运行 \`${shortcutName}\`\n    `;
    }
    res += `![shortcutName](${picName})\n`;
  }
  return res;
}

function renderStdouts(outs: StdoutShot[]): string {
  let res = "";
  for (const { pathName, stdout } of outs) {
    if (pathName) {
      res += `* 运行 \`${pathName} help\`\n`;
    }
    res += `\`\`\`\n${stdout}\n\`\`\`\n`;
  }
  return res;
}

function genReadme(payload: {
  task: Task;
  afterInstall: {
    shot: string;
    console: string;
  };
  onRun: {
    shots: RenderPicProps[];
    stdouts: StdoutShot[];
  };
  afterUninstall: {
    console: string;
  };
  meta: Meta;
}) {
  const {
    task: { scope, nepName, fileName },
    afterInstall,
    onRun,
    afterUninstall,
    meta,
  } = payload;
  const time = dayjs().format("YYYY/MM/DD - HH:mm:ss");
  const { installed, uninstalled, nep } = meta;

  // 判断是否 call_installer
  let have_call_installer = false;
  if (nep.permissions.find((item) => item.key === "execute_installer")) {
    have_call_installer = true;
  }

  return `# ${scope}/${nepName}/${fileName} 测试结果

* 测试时间：${time}
* 测试机：Edgeless QA

## 新增的快捷方式
${installed.shortcutsAdded.map((name) => `* \`${name}\``).join("\n")}

## 新增的 PATH 入口
${installed.pathsAdded.map((name) => `* \`${name}\``).join("\n")}

## 安装时控制台输出
\`\`\`
${afterInstall.console}
\`\`\`

## 安装后截图
${renderPics([{ picName: afterInstall.shot }])}

## 运行时截图
${renderPics(onRun.shots)}

## 运行时输出
${renderStdouts(onRun.stdouts)}

## 卸载残留${uninstalled.appRemoved ? "" : "\n * **app 目录**"}${
    have_call_installer
      ? "\n> 备注：此包调用了安装器用于安装和卸载需要人工操作，因此在 QA 报告中出现卸载残留属于正常情况"
      : ""
  }
${uninstalled.appData.map((name) => `* \`${name}\``).join("\n")}

## 卸载时控制台输出
\`\`\`
${afterUninstall.console}
\`\`\`

## Meta
\`\`\`
${JSON.stringify(meta, null, 2)}
\`\`\`

## QA日志
\`\`\`
${exportLog()}
\`\`\`

`;
}

export { genReadme };
