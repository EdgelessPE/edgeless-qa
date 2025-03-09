import cp from "node:child_process";
import fs from "node:fs";
import type { Result } from "ts-results";
import type { Task } from "../types";
import { LOCATIONS } from "./constants";
import { log } from "./log";
import { takeShot } from "./network";
import { sleep } from "./utils";

function getShortcuts(): string[] {
	let res: string[] = [];
	const p = [LOCATIONS.DESKTOP, LOCATIONS.PUBLIC_DESKTOP];
	p.forEach((location) => {
		res = res.concat(
			fs
				.readdirSync(location)
				.filter((name) => name.toLowerCase().endsWith(".lnk")),
		);
	});
	// if(addLog) log(`Info:Got shortcuts : ${JSON.stringify(res)}`)
	return res;
}

// 返回截图
async function spawnShortcut(
	p: string,
	task: Task,
): Promise<{ shortcutName: string; res: Result<string, string> }> {
	await sleep(10000);
	return new Promise((resolve) => {
		cp.exec(`explorer "${p}"`, async () => {
			log(`Info:Take shot for ${p}`);
			const res = await takeShot({ ...task, stage: "onRun" });
			resolve({
				shortcutName: p,
				res,
			});
		});
	});
}

export { getShortcuts, spawnShortcut };
