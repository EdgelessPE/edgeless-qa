import fs from "node:fs";
import path from "node:path";
import { LOCATIONS } from "./constants";
import { log } from "./log";

interface AppDataNode {
	name: string;
	path: string;
	set: Set<string>;
}

function scanner(p: string): AppDataNode {
	const dir = fs.readdirSync(p).filter((name) => {
		const pa = path.join(p, name);
		try {
			return fs.statSync(pa).isDirectory();
		} catch (e) {
			if (!pa.includes("WindowsApps")) {
				log(`Warning:Failed to read ${pa}`);
			}
			return false;
		}
	});
	// log(`Info:Scanned ${p} : ${dir.join(",")}`)
	return {
		name: path.basename(p),
		path: p,
		set: new Set(dir),
	};
}

function compare(
	prefix: string,
	before: Set<string>,
	after: Set<string>,
): string[] {
	const res: string[] = [];
	for (const name of after) {
		if (!before.has(name)) res.push(`${prefix}/${name}`);
	}
	return res;
}

function giantScanner() {
	const p = [
		path.join(LOCATIONS.APPDATA_ROOT, "Roaming"),
		path.join(LOCATIONS.APPDATA_ROOT, "Local"),
		path.join(LOCATIONS.APPDATA_ROOT, "LocalLow"),
		LOCATIONS.PROGRAM_FILES_X64,
		LOCATIONS.PROGRAM_FILES_X86,
		// LOCATIONS.PROGRAM_DATA
	];
	return p.map(scanner);
}

function giantCompare(before: AppDataNode[]): string[] {
	let res: string[] = [];
	before.forEach((node) => {
		res = res.concat(compare(node.name, node.set, scanner(node.path).set));
	});
	return res;
}

export { giantScanner, giantCompare };
