import cp from "node:child_process";
import { Err, Ok, type Result } from "ts-results";
import { VM_NAME, VM_SNAPSHOT } from "./constants";
import { isDev } from "./env";
import { sleep } from "./utils";

async function exec(cmd: string): Promise<Result<null, string>> {
	return new Promise((resolve) => {
		cp.exec(cmd, (error, stdout, stderr) => {
			if (error) {
				resolve(new Err(`Error:Failed to exec cmd '${cmd}' : ${stderr}`));
			} else {
				resolve(new Ok(null));
			}
		});
	});
}

async function startVM(): Promise<Result<null, string>> {
	const backTo = isDev ? undefined : VM_SNAPSHOT;
	if (backTo) {
		// 回滚虚拟机快照
		const bRes = await exec(`VboxManage snapshot ${VM_NAME} restore ${backTo}`);
		if (bRes.err) return bRes;
	}
	await sleep(5000);
	return exec(`VboxManage startvm ${VM_NAME}`);
}

async function shotVM(saveTo: string) {
	return exec(`VboxManage controlvm ${VM_NAME} screenshotpng "${saveTo}"`);
}

async function stopVM() {
	await sleep(5000);
	return exec(`VboxManage controlvm ${VM_NAME} poweroff`);
}

export { startVM, shotVM, stopVM };
