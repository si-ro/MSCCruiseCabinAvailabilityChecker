const puppeteer = require('puppeteer');
const {CronJob} = require('cron');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'debug';

// SELECT YOUR CRUISE DETAILS URL
const cruiseDetailsUrl = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';

const slackUserOrRoom = '@siro';

const headers = {
  // 'user-agent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
  'upgrade-insecure-requests': '1',
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'scheme': 'https',
  'path': '/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0',
  'method': 'GET',
  'authority': 'www.msccruisesusa.com',
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const checkCruise = (hubot) => {
  logger.debug('Start check booking process.');
  hubot.send({room: slackUserOrRoom}, 'Start check MSC Cruise cabin availability...');
  logger.debug(`-> URL: ${cruiseDetailsUrl}`);

  puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    devtools: false,
    defaultViewport: {
      width: 1280,
      height: 1024,
    },
    // args: ['--allow-external-pages', '--allow-insecure-localhost', '--allow-running-insecure-content', '--ignore-certificate-errors', '--enable-features=NetworkService'],
    // args: ['--disable-web-security', '--allow-running-insecure-content', '--allow-insecure-localhost', '--non-secure'],
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }).then(async browser => {
    try {
      const context = browser.defaultBrowserContext();
      await context.overridePermissions('https://www.msccruisesusa.com', ['background-sync', 'accessibility-events', 'payment-handler']);
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1');
      await page.setExtraHTTPHeaders(headers);
      await page.setJavaScriptEnabled(true);
      await page.goto(cruiseDetailsUrl);
      await page.waitForSelector('#cruise-detail_book-now_bottom');
      await page.click('#cruise-detail_book-now_bottom');
      // await page.waitForSelector('#confirmPaxConfigButton');
      // await page.click('#confirmPaxConfigButton');
      await page.waitForSelector('.tab-price-cat-YC1-1-10');

      const result = await page.$('.tab-price-cat-YC1-1-10 .cs-price').innerText;
      let message = `Finish check MSC cruise. -> ${result}.`;
      if (result !== 'Fully Booked') {
        message += `\nCabin is availability! Check soon! -> ${cruiseDetailsUrl}`;
      }
      hubot.send({room: slackUserOrRoom}, message);
    } catch (error) {
      logger.error(`Unknown error occured. error: ${error}`);
      hubot.send({room: slackUserOrRoom}, `Failed check MSC Cruise cabin availability. error: ${error}`);
    } finally {
      browser.close();
    }

  });
};
module.exports = ((hubot) => {
  hubot.hear(/msc/i, res => {
    checkCruise(hubot);
  });

  new CronJob('0 0 * * * *', () => {
      checkCruise(hubot);
    }
    , null, true);
});
