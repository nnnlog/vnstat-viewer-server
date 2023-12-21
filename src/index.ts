process.env.TZ = "Asia/Seoul";

import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";
import {Hono} from "hono";
import {createServer} from "http";
import VNStat from "./vnstat/VNStat";

const manager = new VNStat("enp5s0");

const app = new Hono();

app.use("/static/*", serveStatic({root: `${__dirname}/static/dist`}));

app.get("/:type", async (c) => {
	const type = c.req.param("type");
	if (!["f", "h", "d", "m", "y"].includes(type)) {
		c.status(400);
		return c.json({
			status: -1,
		});
	}
	// let start = 0, end = Date.now();
	const {start, end} = c.req.query();
	let x = parseInt(start), y = parseInt(end);
	if (isNaN(x) || !isFinite(x) || isNaN(y) || !isFinite(y)) {
		x = 0;
		y = Date.now();
	}
	return c.json({
		status: 0,
		data: (await manager.getCachedData(type)).filter(value => {
			const date = VNStat.convertToTimestamp(value);
			return x <= date && date <= y;
		}),
	});
});

serve({
	fetch: app.fetch,
	createServer,
}, info => {
	console.log(`Listening on http://localhost:${info.port}`);
});
