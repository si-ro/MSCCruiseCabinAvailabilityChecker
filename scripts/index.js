const puppeteer = require('puppeteer');
const {CronJob} = require('cron');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'info';

// SELECT YOUR CRUISE DETAILS URL
const cruiseDetailsUrl = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';

const slackUserOrRoom = '@siro';

const headers = {
  pragma: 'no-cache',
  'cache-control': 'no-cache',
};

// SELECT YOUR PREFERRED STATEROOM
const cabinType = 'YC1';

const checkCruise = (hubot) => {
  logger.debug('Start check booking process.');
  hubot.send({room: slackUserOrRoom}, `Start check MSC Cruise ${cabinType} cabin availability...`);
  logger.debug(`-> URL: ${cruiseDetailsUrl}`);

  puppeteer.launch({
    headless: true,
    devtools: false,
    defaultViewport: {
      width: 1280,
      height: 1024,
    },
  }).then(async browser => {
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1');
      await page.goto(cruiseDetailsUrl);
      await page.waitForSelector(`td[data-code='${cabinType}']`);

      const element = await page.$(`td[data-code='${cabinType}'] span`);
      const result = await page.evaluate(el => el.innerText, element);

      let message = `Finish check MSC cruise ${cabinType} cabin. -> ${result}.`;
      if (result !== 'Sold Out') {
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
