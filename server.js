const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const sizeOf = require('image-size');
let baseUrl = process.argv[2];
let baseStorageDir = process.argv[3];
(async () => {
  console.time('start')
  let pages = []
  for (let i = 0; i < 5; i++) {
    let browser = await puppeteer.launch({
      headless: true,
      userDataDir: __dirname + '/cache' + i
    })
    let page = await browser.newPage().catch(err => console.log(err))
    page.emulate(devices['iPhone 6'])
    pages.push({page, switch: true})
  }
  console.timeEnd('start')
  app.get('/screenshot', (req, res) => {
    let page
    let interval = setInterval(async () => {
      let item = pages.find((page) => {return page.switch === true})
      if (item) {
        clearInterval(interval)
        item.switch = false
        try {
          page = item.page
          for (let i = 0; i < 2; i++) {
            try {
              if (i === 0) {
                await page.goto(decodeURIComponent(req.query.page), { timeout: 5000 })
              } else {
                await page.goto(decodeURIComponent(req.query.page))
              }
              break
            } catch (err) {
              console.log(err)
            }
          }
          let screenPage
          if (req.query.selector) {
            let selector = decodeURIComponent(req.query.selector)
            let element = await page.$(selector)
            let boundingBox = await element.boundingBox()
            screenPage = await page.screenshot({
              path: `${baseStorageDir}/${req.query.filename}.png`,
              fullPage: false,
              clip: boundingBox
            });
          } else {
            screenPage = await page.screenshot({
              path: `${baseStorageDir}/${req.query.filename}.png`,
              fullPage: true
            });
          }
          let dimensions = await sizeOf(screenPage);
          res.status(200).send({
            url: `${baseUrl}/${req.query.filename}.png`,
            width: dimensions.width,
            height: dimensions.height
          });
          item.switch = true
        } catch (error) {
          console.error(error)
          res.status(500).send({msg: error.message});
          item.switch = true
        }
      }
    }, 100)
  })
})();
app.listen(3000, function () {
  console.log('listening on port 3000')
});
