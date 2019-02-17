const Nightmare = require('nightmare');
const {CronJob} = require('cron');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'debug';

// SELECT YOUR CRUISE DETAILs URL
const cruiseDetailsUrl = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';
// SELECT YOUR PREFERRED STATEROOM
const cabinType='tab-price-cat-YC1-1-10';

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
  logger.debug(`-> URL: ${cruiseDetailsUrl}`);

  const nightmare = Nightmare({
    show: false,
    // openDevTools: {
    //   mode: 'detach'
    // },
    waitTimeout: 30000,
  });

  nightmare
    .goto(cruiseDetailsUrl, headers)
    .wait('#cruise-detail_book-now_bottom')
    .click('#cruise-detail_book-now_bottom')
    .wait(`.${cabinType}`)
    .evaluate(() => {
      return document.querySelector(`.${cabinType} .cs-price`).innerText;
    })
    .end(result => `-> Result: ${result}`)
    .then((result) => {
      logger.log(`Finish check MSC cruise. ${result}`);
      hubot.send({user: {name: 'siro'}}, result);
    })
    .catch(error => {
      logger.error(`Unknown error occured. error: ${error}`);
    })
};
module.exports = ((hubot) => {
  // const contents = await hubot.http('https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CabinSelectionView?catalogId=10001&langId=-1004&storeId=12264&krypto=gLffhwKTy7QgpQHFc%2F9BLbGEj7dt9Mf5SA8iyvAP4AmsJpPPtzobIkuSROYC31Ilf3dDWbJGG2p32UqqyYfKM1fBhFb%2BPkLXwDxBz%2F7nwKyRvyHToP4o640aI6QssFk%2F%2FUkl4JQrbI0gLryYuGtzkog79xuJh5O0gVp%2B%2BDjRY41JZOP59eSY%2BNXF%2BbyhxdhdhbBzDkDfT6BgYZICj5IpwBJbMNOS9ZOlqLPawe1nUXtBGAoFqIrk%2B49ICPo8WitfMsOHhvqxxsF9wB6yB2TL0q1BeMMSFwQuSOjDx2OHVmbIQslATKUBgsyNwTOzklLZzivZyeZqfcFSplrjhwHAsOjaaxNH3zkcpIfADRu4RChYipc1LiFmm1pPmBxf5smczdfYQNN1DXAOYvS%2Fd58sy%2F%2B1Zj806hYMODt6FPz2Hac3UXtf9WQXn0xVEwC7%2FMVxbrJbU5dKoOOY36OFI62VD8OWwKicBAzq30rKCQLkASLkY0Hg%2F4E%2F9RigMBDz5QU3&ddkey=https%3ACopySetCurrentOrderCmd');

  hubot.hear(/msc/i, res => {
    checkCruise(hubot);
  });

  new CronJob('0 0 * * * *', () => {
      checkCruise(hubot);
    }
    , null, true, 'Asia/Tokyo');
});
