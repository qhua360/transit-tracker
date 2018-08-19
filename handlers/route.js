const helpers = require('../helpers');

var route = module.exports = {}

route.handler = (conv, { number }) => {
    let found = false;
    conv.data.routes.forEach(function (route, i) {
        if (number && number == route.short_name) {
            conv.data.chosenRoute = number;
            conv.data.routeInfo = route;
            const directions = helpers.buildStringFromList(conv.data.routeInfo.directions,
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
}
