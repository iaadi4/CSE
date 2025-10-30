import "dotenv/config";
import App from "./app";
import { prisma } from "./db";

async function bootstrap() {
	// Try to establish a Prisma connection before starting the server
	let attempts = 0;
	const maxAttempts = 3;
	const backoff = (n: number) => new Promise((res) => setTimeout(res, 1500 * n));

	while (attempts < maxAttempts) {
		try {
			await prisma.$connect();
			console.log("Prisma connected to the database.");
			break;
		} catch (err) {
			attempts += 1;
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`Prisma connect attempt ${attempts} failed: ${msg}`);
			if (attempts >= maxAttempts) {
				throw err;
			}
			await backoff(attempts);
		}
	}

	const app = new App();
	app.start();
}

bootstrap().catch((err) => {
	console.error("Fatal startup error:", err);
	process.exit(1);
});