"use strict";
const {
  $,
  openBrowser,
  write,
  checkBox,
  textBox,
  screenshot,
  dropDown,
  closeBrowser,
  click,
  goto,
  below,
  press,
  text,
  toLeftOf,
  focus,
  inputField,
  toRightOf
} = require("taiko");
const fs = require("fs");
const assert = require("assert");
const headless = true;
const testMacro = `run("Blobs (25K)");
setAutoThreshold("Default");
setOption("BlackBackground", true);
run("Convert to Mask");
run("Analyze Particles...", "size=5-Infinity add");`;

async function clickMenu(path) {
  const items = path.split(">");
  for (let i = 0; i < items.length; i++) {
    await click(items[i]);
    if (i < items.length - 1) await text(items[i + 1]).exists();
  }
  // clear menu
  await click("ImageJ");
}
async function closeWindow(title) {
  await click($(`.controls`), toRightOf(title));
}

let screenshotIndex = 0;
if (!fs.existsSync("./screenshots")) fs.mkdirSync("./screenshots");

async function takeScreenshot() {
  await screenshot({ path: `./screenshots/screenshot-${screenshotIndex}.png` });
  screenshotIndex++;
}
async function has(string, timeout) {
  await assert.ok(
    await text(string).exists(timeout),
    `Text not found: ${string}`
  );
}

describe("Testing ImageJ.JS", () => {
  before(async () => {
    await openBrowser({ headless: headless });
  });

  describe("ImageJ.JS", () => {
    it("Start imagej.js", async () => {
      goto("http://127.0.0.1:9090/");
      await takeScreenshot();
      await text("CheerpJ runtime ready").exists();
      await text("Graphics system is initializing").exists();
      await takeScreenshot();
      await text("ImageJ").exists(10000);
      await text("About ImJoy").exists(10000);
      await has("ImageJ");
      await click("ImageJ");
      await has("File");
      await takeScreenshot();
    });

    it("Segment step by step", async () => {
      await has("File");
      await clickMenu("File>Open Samples>Blobs");
      await has("blobs.gif");
      await takeScreenshot();

      // click options
      await clickMenu("Image>Adjust>Threshold...");
      await has("Threshold");
      // await checkBox(toLeftOf('Dark background')).check()
      await has("Apply");
      await takeScreenshot();
      await closeWindow("Threshold");

      // click options
      await clickMenu("Process>Binary>Options...");
      await has("Binary");
      await checkBox(toLeftOf("Black background")).check();
      await takeScreenshot();
      await click("OK");

      // click Convert to Mask
      await clickMenu("Process>Binary>Convert to Mask");
      await closeWindow("blobs.gif");
    });

    it("Segment via macro", async () => {
      await click("ImageJ");
      await has("Plugins");
      await clickMenu("Plugins>New>ImJoy Code Editor");
      await write(testMacro, textBox(below("Export")));
      await takeScreenshot();
      await click("Run");
      await has("ROI Manager");
      await takeScreenshot();
      await click("Measure");
      await has("Results");
      await takeScreenshot();
    });
  });

  after(async () => {
    await closeBrowser();
  });
});
