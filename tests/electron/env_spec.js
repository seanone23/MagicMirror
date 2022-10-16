// see https://playwright.dev/docs/api/class-electronapplication

const { _electron: electron } = require("playwright");

let electronApp = null;
process.env.MM_CONFIG_FILE = "tests/configs/modules/display.js";
jest.retryTimes(3);

describe("Electron app environment", () => {
	beforeEach(async () => {
		electronApp = await electron.launch({ args: ["js/electron.js"] });
	});

	afterEach(async () => {
		await electronApp.close();
	});

	it("should open browserwindow", async () => {
		expect(await electronApp.windows().length).toBe(1);
		const page = await electronApp.firstWindow();
		expect(await page.title()).toBe("MagicMirror²");
		expect(await page.isVisible("body")).toBe(true);
		const module = page.locator("#module_0_helloworld");
		await module.waitFor();
		expect(await module.textContent()).toContain("Test Display Header");
	});
});

describe("Development console tests", () => {
	beforeEach(async () => {
		electronApp = await electron.launch({ args: ["js/electron.js", "dev"] });
	});

	afterEach(async () => {
		await electronApp.close();
	});

	it("should open browserwindow and dev console", async () => {
		const pageArray = await electronApp.windows();
		expect(pageArray.length).toBe(2);
		for (const page of pageArray) {
			expect(["MagicMirror²", "DevTools"]).toContain(await page.title());
		}
	});
});
