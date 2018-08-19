const request = require('request-promise');

const helpers = require('../helpers');

var permission = module.exports = {}

const transit = 'https://public.transitapp.com/v3/routes/nearby';
let propertiesObject = {
  filter: '21',
  distance: '500',
};

permission.handler = (conv, params, permissionGranted) => {
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
                const routes = helpers.buildStringFromList(conv.data.routes, function (item) {
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
}
