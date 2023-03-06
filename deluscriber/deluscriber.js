'use strict'

const puppeteer = require('puppeteer')
const clipboard = require("node-clipboardy")
const { selectors } = require('./deluscrib.json')

class Deluscriber {
  constructor () {
    this.browser = null
    this.page = null
    this.scribFrame = null
  }

  async init (options = { headless: true, slowMo: 0 }) {
    this.browser = await puppeteer.launch(options)
    this.page = await this.browser.newPage()

    await this.page.goto('https://scribens.fr/', { waitUntil: 'domcontentloaded' })

    await this.page.setRequestInterception(true)

    const rejectRequestPattern = [
      "googlesyndication.com",
      "/*.doubleclick.net",
      "/*.amazon-adsystem.com",
      "/*.adnxs.com",
    ];
    const blockList = [];
    this.page.on("request", (request) => {
      if (rejectRequestPattern.find((pattern) => request.url().match(pattern))) {
        blockList.push(request.url())
        request.abort()
      } else request.continue()
    });

    // Set screen size
    await this.page.setViewport({width: 1080, height: 1024});

    // Accept cookies
    await this.page.waitForNetworkIdle();
    const cookiesFrame = this.page.frames().find(f => f.url().startsWith('https://cdn.privacy-mgmt.com/'));
    await cookiesFrame.click(selectors.acceptCookies);

    // Wait for the scribFrame to load
    await this.page.waitForSelector(selectors.scribFrame);
    this.scribFrame = this.page.frames().find(f => f.name() === 'FrameTx')
  };

  copyToClipboard (text) {
    clipboard.write(text)
  }

  async pasteFromClipboard () {
    await this.scribFrame.click('body')
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('V')
    await this.page.keyboard.up('Control')
  }

  async verify () {
    await this.page.click(selectors.verify)
    await this.page.waitForSelector(selectors.loadingPanel, { hidden: true })
  }

  async setExample () {
    await this.page.click(selectors.exampleText)
    await this.page.waitForTimeout(1000)
  }

  async correctErrors () {
    let els = await this.scribFrame.$$(selectors.errorWords)
    while (els.length > 0) {
      els = await this.scribFrame.$$(selectors.errorWords)
      for (const el of els) {
        await el.click()
        await this.page.click(selectors.firstChoice).catch((err)=>{})
      }
    }
  }

  async getCorrection () {
    let text = await this.scribFrame.$eval('body', el => el.innerText)
    return text
  }

  close () {
    this.browser.close()
  }
}

async function main () {
  const deluscriber = new Deluscriber()
  await deluscriber.init({ headless: false }) 
  deluscriber.copyToClipboard('Salut ses moi le beeau goss !')
  await deluscriber.pasteFromClipboard()
  await deluscriber.verify()
  await deluscriber.correctErrors()
  const text = await deluscriber.getCorrection()
  console.log(text)
  deluscriber.close()
}

if (require.main === module) {
  main()
}

module.exports = Deluscriber
