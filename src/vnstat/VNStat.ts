import execute from "./VNStatProcess";

interface VNStatInformation {
	date: { year: number, month: number | undefined, day: number | undefined },
	time: { hour: number, minute: number } | undefined,
	rx: number,
	tx: number,
}

class VNStat {
	private cached: { [key: string]: [VNStatInformation[], number] } = {};

	private readonly interfaceName: string;

	public static convertToTimestamp(information: VNStatInformation): number {
		const date = new Date();
		date.setFullYear(information.date.year, (information.date.month ?? 1) - 1, information.date.day ?? 1);
		date.setHours(information.time?.hour ?? 0, information.time?.minute ?? 0, 0);
		date.setSeconds(0, 0);
		return date.getTime();
	}

	constructor(interfaceName: string) {
		this.interfaceName = interfaceName;
	}

	private async getData(type: string): Promise<[VNStatInformation[], number]> {
		const data = await execute(["--json", type, this.interfaceName]);
		const json = JSON.parse(data);
		const traffic = json["interfaces"][0]["traffic"];
		return [traffic[Object.keys(traffic).find(k => k !== "total")!] as VNStatInformation[], Date.now()];
	}

	public async getCachedData(type: string): Promise<VNStatInformation[]> {
		if (this.cached[type] === undefined || this.cached[type][1] + 1000 * 60 * 5 < Date.now()) {
			this.cached[type] = await this.getData(type);
		}
		return JSON.parse(JSON.stringify(this.cached[type][0])); // clone object
	}

	// public getFiveMinutes() {
	//     return this.getCachedData("f");
	// }
	//
	// public getHours() {
	//     return this.getCachedData("h");
	// }
	//
	// public getDays() {
	//     return this.getCachedData("d");
	// }
	//
	// public getMonths() {
	//     return this.getCachedData("m");
	// }
	//
	// public getYears() {
	//     return this.getCachedData("y");
	// }
}

export default VNStat;
