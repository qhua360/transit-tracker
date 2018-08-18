'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {
  dialogflow,
  Permission,
  Confirmation
} = require('actions-on-google');
const request = require('request-promise');

const PORT = process.env.PORT || 5000;

const transit = 'https://public.transitapp.com/v3/routes/nearby';
let propertiesObject = {
  filter: '21',
  distance: '500',
};

const buildStringFromList = (list, format) => {
  let str = '';
  if (list.length) {
    list.forEach(function (item, i) {
      if (list.length > 1 && i == list.length - 1) str += 'and ';
      str += format(item);
      if (i != list.length - 1) {
        if (list.length > 1) str += ',';
        str += ' ';
      }
    });
  }
  return str;
};

const getDiffFromTimeString = str => {
  let date = new Date(str);
  let now = new Date();
  const dayMs = 1000 * 60 * 60 * 24, hMs = 1000 * 60 * 60, minMs = 1000 * 60;
  const hm = Math.floor(((date - now) % dayMs) / hMs);
  return Math.floor((((date - now) % dayMs) % hMs) / minMs) + (hm ? hm * 60 : 0);
}

const agent = dialogflow();

agent.intent('Default Welcome Intent', (conv) => {
  conv.ask(new Permission({
    context: 'Hi there',
    permissions: 'DEVICE_PRECISE_LOCATION',
  }));
});

agent.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    conv.close(`Sorry, I can't look up buses near you then`);
  } else {
    propertiesObject.lat = conv.device.location.coordinates.latitude;
    propertiesObject.lng = conv.device.location.coordinates.longitude;
    const options = {
      uri: transit,
      qs: propertiesObject,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true,
    };
    return request(options).then(function (response) {
      conv.data.routes = response.routes;
      if (conv.data.routes.length) {
        const routes = buildStringFromList(conv.data.routes, function (item) {
          return item.short_name + ' ' + item.long_name;
        });
        conv.ask(`Which route would you like? Your choices are ${routes}.`);
        Promise.resolve();
      } else {
        conv.close(`There are no routes near you.`);
        Promise.resolve();
      }
    }).catch(function (err) {
      console.log(err);
      conv.close(`Sorry, lookup failed.`);
      Promise.resolve();
    });
  }
});

agent.intent('route chosen', (conv, { number }) => {
  let found = false;
  conv.data.routes.forEach(function (route, i) {
    if (number && number == route.short_name) {
      conv.data.chosenRoute = number;
      conv.data.routeInfo = route;
      const directions = buildStringFromList(conv.data.routeInfo.directions,
        function (item) {
          return item.schedule_items &&
            item.schedule_items[0] &&
            item.schedule_items[0].headsign ?
            item.schedule_items[0].headsign : '';
        });
      conv.ask(`Which direction would you like to know about? Your choices are ${directions}.`);
      found = true;
    }
  });
  if (!found) conv.close(`Sorry, you didn't give a valid bus.`);
});

agent.intent('direction chosen', (conv, { any }) => {
  let found = false;
  conv.data.routeInfo.directions.forEach((direction, i) => {
    if (!found &&
      direction.schedule_items &&
      direction.schedule_items[0] &&
      any == direction.schedule_items[0].headsign) {
        conv.data.chosenDirection = any;
        const diff = getDiffFromTimeString(direction.schedule_items[0].departure_time);
        conv.ask(`Your bus leaves from ${direction.closest_stop.name} in ${diff} minutes. Would you like to hear about the next ones?`);
        conv.data.i = i;
        found = true;
      }
    });
    if (!found) conv.close(`Sorry, you didn't give a valid direction.`);
});

const savePhrase = 'Would you like to save this route as your favorite in the future?';

agent.intent('direction chosen - yes', (conv) => {
  if (conv.data.routeInfo.directions[conv.data.i].schedule_items.length === 1) conv.ask(`There are no other buses`);
  else {
    const buses = buildStringFromList(conv.data.routeInfo.directions[conv.data.i].schedule_items.slice(0),
                                      item => {
                                        return getDiffFromTimeString(item.departure_time);
                                      });
    conv.ask(`The next buses arrive in ${buses} minutes. ${savePhrase}`);
  }
});

agent.intent('direction chosen - yes - yes', (conv) => {
  conv.ask(new Confirmation('Confirm saving ' + conv.data.chosenRoute + ' to ' + conv.data.chosenDirection + ' as your favorite?'));
});

agent.intent('direction chosen - yes - no', (conv) => {
  conv.close(`Have a nice day!`);
});

agent.intent('direction chosen - no', (conv) => {
  conv.ask(new Confirmation(savePhrase));
});

agent.intent('actions_intent_CONFIRMATION', (conv, params, confirmationGranted) => {
  if (confirmationGranted) {
    conv.user.storage.chosenRoute = conv.data.chosenRoute;
    conv.user.storage.chosenDirection = conv.data.chosenDirection;
  }
  conv.close(`Have a nice day!`);
});


express().use(bodyParser.json(), agent).listen(PORT, () => console.log(`App listening on port ${PORT}!`));
