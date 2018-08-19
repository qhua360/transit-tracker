const helpers = require('../helpers');

var direction = module.exports = {}

direction.handler = (conv, { any }) => {
    let found = false;
    conv.data.routeInfo.directions.forEach((direction, i) => {
        if (!found &&
            direction.schedule_items &&
            direction.schedule_items[0] &&
            any == direction.schedule_items[0].headsign) {
            conv.data.chosenDirection = any;
            const diff = helpers.getDiffFromTimeString(direction.schedule_items[0].departure_time);
            conv.ask(`Your bus leaves from ${direction.closest_stop.name} in ${diff} minutes. Would you like to hear about the next ones?`);
            conv.data.i = i;
            found = true;
        }
    });
    if (!found) conv.close(`Sorry, you didn't give a valid direction.`);
}

direction.follow = (conv) => {
    if (conv.data.routeInfo.directions[conv.data.i].schedule_items.length === 1) conv.ask(`There are no other buses`);
    else {
        const buses = helpers.buildStringFromList(conv.data.routeInfo.directions[conv.data.i].schedule_items.slice(0),
            item => {
                return helpers.getDiffFromTimeString(item.departure_time);
            });
        conv.ask(`The next buses arrive in ${buses} minutes. ${savePhrase}`);
    }
}
