const { default: puppeteer } = require("puppeteer");
const clipboard = require("node-clipboardy");
const { selectors } = require("./deluscriber/deluscrib.json");

clipboard.write(`Quoique l'actualité nous laisse penser, ne désespérons pas trop vite de la nature humaine... Il y a peu, dans le Nord de la France, un super-marché a été laissé grand ouvert l'après-midi alors qu'il était sensé fermer ses portes à 13 heures : la faute à une employée étonamment distraite, par trop impatiente de regagner ses chères pénates ! Et bien, si bizzare que cela puisse paraître, aucun vol, aucune dégradation ne furent à déplorer. Éberlués que personne ne fut là pour les acceuillir, les clients, le premier moment de surprise passée, ont alerté la police ! Gageons que ces citoyens comme on en fait plus se seront vus remplir leur carte de fidélité : par les temps qui courent, on serait malvenu à mégotter...`);

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://scribens.fr/');

  await page.setRequestInterception(true);
 
  const rejectRequestPattern = [
    "googlesyndication.com",
    "/*.doubleclick.net",
    "/*.amazon-adsystem.com",
    "/*.adnxs.com",
  ];
  const blockList = [];
 
  page.on("request", (request) => {
    if (rejectRequestPattern.find((pattern) => request.url().match(pattern))) {
      blockList.push(request.url());
      request.abort();
    } else request.continue();
  });


  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Accept cookies
  await page.waitForNetworkIdle();
  const cookiesFrame = page.frames().find(f => f.url().startsWith('https://cdn.privacy-mgmt.com/'));
  await cookiesFrame.click(selectors.acceptCookies);
  
  // Wait for the scribFrame to load
  await page.waitForSelector(selectors.scribFrame);

  const scribFrame = page.frames().find(f => f.name() === 'FrameTx');
  await scribFrame.click('body');
  await page.keyboard.down('Control');
  await page.keyboard.press('V');
  await page.keyboard.up('Control');

  await page.click(selectors.verify);
  await page.waitForSelector(selectors.loadingPanel, { hidden: true });

  let els = await scribFrame.$$(selectors.errorWords);
  while (els.length > 0) {
    els = await scribFrame.$$(selectors.errorWords);
    for (const el of els) {
      await el.click();
      await page.click(selectors.firstChoice).catch((err)=>{});
    }
  }
  
  let text = await scribFrame.$eval('body', el => el.innerText);
  console.log(text);

})();