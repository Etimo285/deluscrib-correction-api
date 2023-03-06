'use strict'

const puppeteer = require('puppeteer')
const { selectors } = require('./deluscrib.json')

class Deluscriber {
  constructor () {
    this.browser = null
    this.page = null
  }

  async init (headless = true, slowMo = 0) {
    this.browser = await puppeteer.launch({ headless, slowMo })
    this.page = await this.browser.newPage()

    await this.page.goto('https://scribens.fr/');

    // Set screen size
    await this.page.setViewport({ width: 1080, height: 1024 })
  };

  close () {
    this.browser.close()
  }
}

async function main () {
  const deluscriber = new Deluscriber()
  await deluscriber.init(false, 50)
  await deluscriber.close()
}

if (require.main === module) {
  main()
}

module.exports = Deluscriber
