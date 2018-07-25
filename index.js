'use strict';

var express = require('express');
const {dialogflow, Permission} = require('actions-on-google');
const request = require('request-promise');
const PORT = process.env.PORT || 5000;

var app = express();

const transit = 'https://public.transitapp.com/v3/routes/nearby';
let propertiesObject = {
  filter: '21',
  distance: '500',
};

const buildStringFromList = function(list, format) {
  let str = '';
  list.foreach(function(item, i) {
    if (list.length > 1 && i == list.length - 1) str += 'and ';
    str += format(item);
    if (i != list.length - 1) {
      if (list.length > 1) str += ',';
      routes += ' ';
    }
  });
  return str;
};

app.post('/', function (req, res) {
  const agent = dialogflow({reques: req, response: res });

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
        json: true,
      };
      request(options).then(function(response) {
        conv.data.routes = response.routes;
        const routes = buildStringFromList(conv.data.routes, function(item) {
          return item.short_name + ' ' + item.long_name;
        });
        conv.ask(`Which route would you like? Your choices are ${routes}`);
      }).catch(function(err) {
        conv.close(`Sorry, lookup failed`);
      });
    }
  });
  
  agent.intent('route chosen', (conv, {number}) => {
    conv.data.routes.forEach(function(route, i) {
      if (number && number == route.short_name
       || address && address == route.long_name) {
        conv.data.chosenRoute = route;
        const directions = buildStringFromList(conv.data.chosenRoute.directions,
          function(item) {
          return item.schedule_items
              && item.schedule_items[0]
              && item.schedule_items[0].headsign
              ? item.schedule_items[0].headsign : '';
          });
         conv.ask(`Which direction would you like to know about? Your choices are ${directions}`);
       }
    });
    conv.close(`Sorry, lookup failed`);
  });
  
  agent.intent('direction chosen', (conv, {address}) => {
    conv.data.chosenRoute.directions.forEach(function(direction, i) {
      if (direction.schedule_items
       && direction.schedule_items[0]
       && address == direction.schedule_items[0].headsign) {
         conv.close(`Your bus leaves from ${direction.closest_stop.name}`
                  + ` at ${direction.schedule_items[0].departure_time}`);
       }
    });
  });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))
