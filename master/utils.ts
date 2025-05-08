import fs from "node:fs";
import path from "node:path";
import { REPORT_DIR, TIMEOUT } from "./constants";
import dayjs from "dayjs";

export function mkdir(p: string) {
	if (!fs.existsSync(p)) {
		fs.mkdirSync(p, {
			recursive: true,
		});
	}
}

export function getReportDir(scope: string, nepName: string, fileName: string) {
	const p = path.join(REPORT_DIR, scope, nepName, fileName);
	mkdir(p);
	return p;
}

export async function sleep(ms: number) {
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

export function log(text: string) {
	console.log(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] ${text}`);
}
