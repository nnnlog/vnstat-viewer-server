import {spawn} from "node:child_process";

const execute = async (params: string[]): Promise<string> => {
	const process = spawn("vnstat", params, {
		stdio: "pipe",
	});
	let ret = "";
	process.stdout.on("data", d => ret += d.toString());
	return new Promise(r => process.on("exit", () => r(ret)));
};

export default execute;
