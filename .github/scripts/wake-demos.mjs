// Opens each live demo in a real browser so free hosting does not put it to sleep.
// Streamlit Community Cloud sleeps after ~12 h without visitors; Hugging Face Spaces after ~48 h.
import { chromium } from 'playwright';

const demos = [
  'https://resume-screening-workspace.streamlit.app',
  'https://marine-dashboard.streamlit.app',
  'https://huggingface.co/spaces/SA1259/PMS_CHATBOT',
];
const wakeButtons = /get this app back up|restart this space|wake/i;

const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
let failed = 0;
for (const url of demos) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForTimeout(8_000);
    const button = page.getByRole('button', { name: wakeButtons });
    if (await button.count()) {
      console.log(`${url}: asleep, waking it`);
      await button.first().click();
      await page.waitForTimeout(90_000);
    } else {
      await page.waitForTimeout(20_000);
    }
    console.log(`${url}: visited (${await page.title()})`);
  } catch (error) {
    failed++;
    console.error(`${url}: ${error.message}`);
  } finally {
    await page.close();
  }
}
await browser.close();
process.exit(failed === demos.length ? 1 : 0);
