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
    shot: string;
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
  const time = dayjs().format("YYYY/MM/DD HH:mm:ss");
  const { installed, uninstalled, nep } = meta;

  // 判断是否 call_installer
  let have_call_installer = false;
  if (nep.permissions.find((item) => item.key === "execute_installer")) {
    have_call_installer = true;
  }

  // 判断是否存在 Error
  const hasError =
    afterInstall.console.includes("Error") ||
    afterUninstall.console.includes("Error");

  // 是否有快捷方式或 PATH
  const noCreation =
    installed.shortcutsAdded.length === 0 && installed.pathsAdded.length === 0;

  return `# ${scope}/${nepName}/${fileName} 测试结果
${hasError ? "> 警告：控制台输出中有 `Error`\n" : ""}
${noCreation ? "> 警告：既没有快捷方式也没有 PATH 被添加\n" : ""}

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

## 卸载残留${
    have_call_installer
      ? "\n> 备注：此包调用了安装器用于安装和卸载需要人工操作，因此在 QA 报告中出现卸载残留属于正常情况\n"
      : ""
  }
${uninstalled.appRemoved ? "" : "* **app 目录**\n"}
${uninstalled.appData.map((name) => `* \`${name}\``).join("\n")}

## 卸载时控制台输出
\`\`\`
${afterUninstall.console}
\`\`\`

## 卸载后截图
${renderPics([{ picName: afterUninstall.shot }])}

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
