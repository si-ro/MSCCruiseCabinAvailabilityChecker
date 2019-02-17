const Nightmare = require('nightmare');
const {CronJob} = require('cron');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'debug';

// SELECT YOUR CRUISE DETAILS URL
const cruiseDetailsUrl = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';

const slackUserOrRoom = '@siro';

const headers = {
  'user-agent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
  'upgrade-insecure-requests': 1,
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  ':scheme': 'https',
  ':path': '/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0',
  ':method': 'GET',
  ':authority': 'www.msccruisesusa.com',
};

const checkCruise = (hubot) => {
  logger.debug('Start check booking process.');
  hubot.send({room: slackUserOrRoom}, 'Start check MSC Cruise cabin availability...');
  logger.debug(`-> URL: ${cruiseDetailsUrl}`);

  const nightmare = Nightmare({
    show: false,
    waitTimeout: 30000,
  });

  nightmare
    .goto(cruiseDetailsUrl, headers)
    .wait('#cruise-detail_book-now_bottom')
    .click('#cruise-detail_book-now_bottom')
    // SELECT YOUR PREFERRED STATEROOM
    .wait('.tab-price-cat-YC1-1-10')
    .evaluate(() => {
      return document.querySelector('.tab-price-cat-YC1-1-10 .cs-price').innerText;
    })
    .end()
    .then((result) => {
      let message = `Finish check MSC cruise. -> ${result}.`;
      if (result !== 'Fully Booked') {
        message += `\nCabin is availability! Check soon! -> ${cruiseDetailsUrl}`;
      }

      logger.debug(message);
      hubot.send({room: slackUserOrRoom}, message);
    })
    .catch(error => {
      logger.error(`Unknown error occured. error: ${error}`);
      hubot.send({room: slackUserOrRoom}, `Failed check MSC Cruise cabin availability. error: ${error}`);
    })
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
