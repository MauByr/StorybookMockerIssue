import { chromium } from "playwright";
import { preview } from "vite";

const expectations = {
    "spymock--array-property-on-function": "list: [a, b]",
    "spymock--class-constructor": "value: 1",
};

const server = await preview({ build: { outDir: "storybook-static" }, preview: { port: 6007 } });
const baseUrl = server.resolvedUrls.local[0];
const browser = await chromium.launch();
let failed = false;

try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const [id, expected] of Object.entries(expectations)) {
        errors.length = 0;
        await page.goto(`${baseUrl}iframe.html?id=${id}&viewMode=story`);
        await page.waitForFunction(
            () =>
                document.querySelector("#storybook-root")?.textContent ||
                document.body.classList.contains("sb-show-errordisplay"),
        );
        const rendered = (await page.locator("#storybook-root").innerText()).trim();
        const ok = rendered === expected;
        failed ||= !ok;
        console.log(`${ok ? "PASS" : "FAIL"} ${id}: expected ${JSON.stringify(expected)}, rendered ${JSON.stringify(rendered)}`);
        if (!ok) {
            const shownError = await page.locator("#error-stack").innerText().catch(() => "");
            for (const message of [...errors, shownError].filter(Boolean)) console.log(`  ${message.split("\n")[0]}`);
        }
    }
} finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
}

process.exitCode = failed ? 1 : 0;
