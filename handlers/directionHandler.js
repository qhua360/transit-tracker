exports.directionIntent = function (conv, {address}) {
    conv.data.chosenRoute.directions.forEach(function (direction, i) {
        if (direction.schedule_items &&
            direction.schedule_items[0] &&
            address == direction.schedule_items[0].headsign) {
                conv.close(`Your bus leaves from ${direction.closest_stop.name} at ${direction.schedule_items[0].departure_time}`);
        }
    });
}