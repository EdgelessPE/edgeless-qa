import { existsSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import sharp from "sharp";
import { Err, None, Ok, type Option, type Result, Some } from "ts-results";
import type { EndReq, StartRes, TakeShotReq } from "../types";
import { EPT_BIN, KEEP_VM_OPEN_WHEN_DEV, VM_SNAPSHOT } from "./constants";
import { isDev } from "./env";
import type { TaskManager } from "./task";
import { getReportDir, log } from "./utils";
import { shotVM, startVM, stopVM } from "./vm";

async function beginATask(
	taskManager: TaskManager,
): Promise<Result<boolean, string>> {
	const get = taskManager.get();
	if (get.some) {
		log(
			`Info:Start task ${get.val.scope}/${get.val.fileName} (${
				taskManager.index + 1
			}/${taskManager.tasks.length})`,
		);
		return (await startVM()).map(() => false);
	}
	log("Info:No tasks left");
	return new Ok(true);
}

async function start(taskManager: TaskManager): Promise<Option<StartRes>> {
	const opt = taskManager.get();

	if (opt.some) {
		return new Some({
			task: opt.unwrap(),
			eptDownload: existsSync(path.join("storage", EPT_BIN))
				? `/storage/${EPT_BIN}`
				: undefined,
		});
	}
	return None;
}

async function takeShot(body: TakeShotReq): Promise<Result<string, string>> {
	const fileStem = `${body.stage}_${dayjs().format("YY-MM-DD-HH-mm-ss")}`;
	const reportDir = getReportDir(body.scope, body.nepName, body.fileName);

	// 截图保存为 png
	const pngName = `${fileStem}.png`;
	const sRes = await shotVM(path.join(reportDir, pngName));
	if (sRes.err) {
		return new Err(`Error:Failed to take screenshot : ${sRes.val}`);
	}

	// 转换为 webp
	const webp = await sharp(path.join(reportDir, pngName))
		.webp({ quality: 50 })
		.toBuffer();
	await unlink(path.join(reportDir, pngName));

	return new Ok(webp.toString("base64"));
}

async function end(
	body: EndReq,
	taskManager: TaskManager,
): Promise<Result<boolean, string>> {
	// 校验完成的任务 name 是否一致
	const curTask = taskManager.get();
	if (
		curTask.none ||
		curTask.unwrap().scope !== body.scope ||
		curTask.unwrap().nepName !== body.nepName ||
		curTask.unwrap().fileName !== body.fileName
	) {
		const c = curTask.unwrapOr({
			fileName: "NO_TASK",
			scope: "NO_SCOPE",
			nepName: "NO_TASK",
		});
		return new Err(
			`Error:Expect current task to be '${c.scope}/${c.nepName}/${c.fileName}',got '${body.scope}/${body.nepName}/${body.fileName}'`,
		);
	}
	const reportDir = getReportDir(body.scope, body.nepName, body.fileName);

	// 保存数据
	const { result } = body;
	if (result.err) {
		// 处理失败
		await writeFile(path.join(reportDir, "Error.txt"), result.val);
		log(`Error:Worker returned failure : ${result.val}`);
	} else {
		// 处理成功
		const { readme } = result.val;
		await writeFile(path.join(reportDir, "README.md"), readme);
		// await writeFile(
		// 	path.join(reportDir, "meta.json"),
		// 	JSON.stringify(meta, null, 2),
		// );
	}

	// 关闭虚拟机
	if (!(isDev && KEEP_VM_OPEN_WHEN_DEV)) {
		const sRes = await stopVM();
		if (sRes.err) {
			return new Err(
				`Error:Failed to shutdown VM : ${JSON.stringify(sRes.val, null, 2)}`,
			);
		}
	}

	// 步进任务队列
	if (taskManager.finish()) {
		log("Info:Next");
		const lRes = await beginATask(taskManager);
		if (lRes.err) {
			return new Err(
				`Error:Failed to begin another task : ${JSON.stringify(
					lRes.val,
					null,
					2,
				)}`,
			);
		}
	} else {
		log("Info:End");
		return new Ok(true);
	}

	return new Ok(false);
}

export { beginATask, start, takeShot, end };
