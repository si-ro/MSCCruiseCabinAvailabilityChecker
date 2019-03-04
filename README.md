# MSC Cruise cabin availability checker

This is a Hubot to check MSC Cruise cabin availability.
You can find out the availability of cabins on a cruise.

### Screenshot

<kbd>![slack bot](screenshot.png)</kbd>

<kbd>![slack bot](screenshot2.png)</kbd>

### Running Locally

Setup

```
$ npm install
```

You can start hubot locally by running:

```
$ bin/hubot
```

### Configuration

You can modify following code directly.

```javascript:scripts/index.js
// SELECT YOUR CRUISE DETAILs URL
const cruiseDetailsUrl = 'https://www.msccruisesusa.com/webapp/wcs/stores/servlet/CruiseDetailsCmd?storeId=12264&catalogId=10001&langId=-1004&partNumber=SV20190805GOAGOA&pageFrom=CruiseResults&listinoCode=B-SVCA91KNE&packageType=_&bestPrice=1138&composition=2,0,0,0';
```

```javascript:scripts/index.js
// SELECT YOUR PREFERRED STATEROOM
const cabinType = 'YC1';
```

* cruiseDetailsUrl  
You can searh MSC Cruise detail.  
https://www.msccruisesusa.com/en-us/Homepage.aspx
* cabinType  
following value avalilable.
    * YIN  
    MSC YACHT CLUB INTERIOR SUITE
    * YC1  
    MSC YACHT CLUB DELUXE SUITE
    * YC3  
    MSC YACHT CLUB ROYAL SUITE
    * I2  
    INSIDE(Fantastica)
    * O2
    OCEAN VIEW(Fantastica)
    * B2  
    BALCONY(Fantastica)
    * S3  
    SUITE(Aurea)
    * SE3  
    GEAND SUITE
    * SJ3  
    SUITE WITH WHITEPOOL TAB
    * SD3  
    TWO-BEDROOM GRAND SUITE
    * FLA  
    SUPER FAMILY
    * FLP  
    SUPER FAMILY PLUS

### Other

I'd like to book MSC YACHT CLUB DELUXE SUITE... But the cabin is not availability now.  
Help me Help Others.
