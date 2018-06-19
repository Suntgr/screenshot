const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const sizeOf = require('image-size');
let baseUrl = process.argv[2];
let baseStorageDir = process.argv[3];
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: __dirname + '/cache'
  });
  const page = await browser.newPage();
  await page.emulate(devices['iPhone 6']);
  app.get('/screenshot', async (req, res) => {
    try {
      await page.goto(decodeURIComponent(req.query.page));
      await page.screenshot({path: `${baseStorageDir}/${req.query.filename}.png`, fullPage: true});
      let dimensions = await sizeOf(`${baseStorageDir}/${req.query.filename}.png`);
      res.status(200).send({
        url: `${baseUrl}/${req.query.filename}.png`,
        width: dimensions.width,
        height: dimensions.height
      });
    } catch (err) {
      res.status(500).send({msg: '生成图片失败'});
    }
  })
})();
app.listen(3000, function () {
  console.log('listening on port 3000')
})
