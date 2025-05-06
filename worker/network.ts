import axios from "axios";
import { Err, None, Ok, type Option, type Result, Some } from "ts-results";
import type { EndReq, StartRes, TakeShotReq } from "../types";
import { MASTER_ADDRESS } from "./constants";
import { sleep } from "./utils";

function tsResults(raw: unknown): any {
	if (typeof raw !== "object" || raw === null || !("val" in raw)) {
		return raw;
	}
	if ("some" in raw && "none" in raw) {
		if ((raw as any).some) {
			return new Some((raw as any).val);
		}
		return None;
	}
	if ("ok" in raw && "err" in raw) {
		if ((raw as any).ok) {
			return new Ok((raw as any).val);
		}
		return new Err((raw as any).val);
	}

	return raw;
}

async function get<T>(url: string): Promise<T> {
	const res = await axios.get(url);
	return tsResults(res.data);
}
async function post<T>(url: string, data: unknown): Promise<T> {
	const res = await axios.post(url, data);
	return tsResults(res.data);
}

async function start(): Promise<Option<StartRes>> {
	return get(`${MASTER_ADDRESS}/start`);
}

async function takeShot(req: TakeShotReq): Promise<Result<string, string>> {
	await sleep(5000);
	return post(`${MASTER_ADDRESS}/takeShot`, req);
}

async function end(req: EndReq): Promise<Result<null, string>> {
	return post(`${MASTER_ADDRESS}/end`, req);
}

export { start, takeShot, end };
