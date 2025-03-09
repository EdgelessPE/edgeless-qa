import fs from "node:fs";
import path from "node:path";
import { None, type Option, Some } from "ts-results";
import type { Task } from "../types";
import { REPORT_DIR } from "./constants";

function getTasks(storage: string): Task[] {
	const list = fs.readdirSync(storage);
	let res: Task[] = [];

	for (const scope of list) {
		const scopeDir = path.join(storage, scope);
		if (fs.statSync(scopeDir).isFile()) continue;
		for (const nepName of fs.readdirSync(scopeDir)) {
			const nepDir = path.join(scopeDir, nepName);
			res = res.concat(
				fs
					.readdirSync(nepDir)
					.filter((fileName) => fileName.endsWith(".nep"))
					.filter((fileName) => {
						const reportDir = path.join(REPORT_DIR, scope, nepName, fileName);
						const done =
							fs.existsSync(path.join(reportDir, "Error.txt")) ||
							fs.existsSync(path.join(reportDir, "README.md"));
						return !done;
					})
					.map((fileName) => ({
						fileName,
						scope,
						nepName,
						download: `/storage/${scope}/${nepName}/${fileName}`,
					})),
			);
		}
	}

	console.log(`Info:Got ${res.length} tasks`);
	return res;
}

export class TaskManager {
	tasks: Task[];
	index: number;
	constructor(storage: string) {
		this.tasks = getTasks(storage);
		this.index = 0;
	}
	get(): Option<Task> {
		const { index, tasks } = this;
		if (index < tasks.length) {
			return new Some(tasks[index]);
		}
		return None;
	}
	finish() {
		console.log(`Info:Finish task ${this.index + 1}`);
		this.index++;
		return this.index < this.tasks.length;
	}
}
