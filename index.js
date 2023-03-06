const { default: puppeteer } = require("puppeteer");
const clipboard = require("node-clipboardy");

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
  const consentFrame = page.frames().find(f => f.url().startsWith('https://cdn.privacy-mgmt.com/'));
  await consentFrame.click('button[title="Accepter et Fermer"]');
  
  // Wait for the mainFrame to load
  await page.waitForSelector('#FrameTx');

  const mainFrame = page.frames().find(f => f.name() === 'FrameTx');
  await mainFrame.click('body');
  await page.keyboard.down('Control');
  await page.keyboard.press('V');
  await page.keyboard.up('Control');

  await page.click('#check');
  await page.waitForSelector('#PanelWait', {hidden: true});

  let els = await mainFrame.$$('.s-rg, .s-bl, .s-ve, .s-or');
  while (els.length > 0) {
    els = await mainFrame.$$('.s-rg, .s-bl, .s-ve, .s-or');
    for (const el of els) {
      await el.click();
      await page.click('.Cor-PopupPanelListeSol>div:first-child>div').catch((err)=>{});
    }
  }
  
  let text = await mainFrame.$eval('body', el => el.innerText);
  console.log(text);

})();