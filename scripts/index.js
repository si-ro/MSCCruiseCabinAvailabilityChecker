const puppeteer = require('puppeteer');
const {CronJob} = require('cron');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'info';

// SELECT YOUR CRUISE DETAILS URL
const cruiseDetailsUrl_USA = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';
const cruiseDetailsUrl_UK = 'https://www.msccruises.co.uk/Booking?CruiseID=SV20190805GOAGOA&Type=CROL&PriceCode=SVGB92N1PR#/category/0';

const slackUserOrRoom = '@siro';
const doubleCheck = true;
const headers = {
  pragma: 'no-cache',
  'cache-control': 'no-cache',
};

const cabinTypeNameMap = {
  'I2': 'INTERIOR',
  'O2': 'OCEAN VIEW',
  'B2': 'BALCONY',
  'S3': 'SUITE',
  'SJ3': 'SUITE WITH WHIRLPOOL BATH',
  'SE3': 'GRAND SUITE',
  'FLA': 'SUPER FAMILY',
  'FLP': 'SUPER FAMILY PLUS',
  'YIN': 'MSC YACHT CLUB INTERIOR',
  'YC1': 'MSC YACHT CLUB DELUXE SUITE',
  'YC3': 'MSC YACHT CLUB ROYAL SUITE',
};
// SELECT YOUR PREFERRED STATEROOM
const cabinType = 'YC1';

const checkCruise = (hubot) => {
  logger.debug('Start check booking process.');
  hubot.send({room: slackUserOrRoom}, `Start check MSC Cruise ${cabinType} cabin availability...`);

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
      page.setDefaultTimeout(60000);
      await page.setUserAgent('Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1');

      logger.debug(`URL: ${cruiseDetailsUrl_USA}`);
      await page.goto(cruiseDetailsUrl_USA);
      await page.waitForSelector(`td[data-code='${cabinType}']`);

      const element = await page.$(`td[data-code='${cabinType}'] span`);
      const result_USA = await page.evaluate(el => el.innerText, element);

      let causion;

      let result = `USA: ${result_USA}`;
      if (result_USA !== 'Sold Out') {
        causion = `\nCabin is availability! Check soon! -> ${cruiseDetailsUrl_USA}`;
      }

      if (doubleCheck) {
        const cabinTypePriceMap = {};
        if (cruiseDetailsUrl_UK) {
          logger.debug(`URL: ${cruiseDetailsUrl_UK}`);
          await page.goto(cruiseDetailsUrl_UK);
          await page.waitForSelector('.section--cabin-types__cabin-type');

          const cabinTypes = await page.$$('.section--cabin-types__cabin-type');

          for (let i = 0; i < cabinTypes.length; i++) {
            const cabinType = cabinTypes[i];
            const name = await page.evaluate(e => e.querySelector('.cabin-type__content__name span').innerText, cabinType);
            const price = await page.evaluate(e => e.querySelectorAll('.cabin-type__content__price span')[1].innerText, cabinType);
            logger.debug(`-> ${name}, ${price}`);

            cabinTypePriceMap[name] = price;
          }
        }

        const result_UK = cabinTypePriceMap[cabinTypeNameMap[cabinType]];
        result = `USA: ${result_USA}, UK: ${result_UK}`;

        if (result_UK !== undefined && result_UK !== 'Not available') {
          causion += `\nCabin is availability! Check soon! -> ${cruiseDetailsUrl_UK}`;
        }
      }

      let message = `Finish check MSC cruise ${cabinType} cabin. -> ${result}.`;

      if (causion) {
        message += causion;
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
