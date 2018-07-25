const request = require('request-promise');

const helper = require('../helper');

const transit = 'https://public.transitapp.com/v3/routes/nearby';
let propertiesObject = {
  filter: '21',
  distance: '500',
};

exports.permissionIntent = function(agent, params, permissionGranted) {
    if (!permissionGranted) {
        agent.close(`Sorry, I can't look up buses near you then`);
    } else {
        propertiesObject.lat = agent.device.location.coordinates.latitude;
        propertiesObject.lng = agent.device.location.coordinates.longitude;
        const options = {
            uri: transit,
            qs: propertiesObject,
            json: true,
        };
        request(options).then(function (response) {
            agent.data.routes = response.routes;
            const routes = helper.buildStringFromList(agent.data.routes, function (item) {
                return item.short_name + ' ' + item.long_name;
            });
            agent.ask(`Which route would you like? Your choices are ${routes}`);
        }).catch(function (err) {
            agent.close(`Sorry, lookup failed`);
        });
    }
}