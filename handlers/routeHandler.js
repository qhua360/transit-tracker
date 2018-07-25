exports.routeIntent = function (agent, {number}) {
    agent.data.routes.forEach(function (route, i) {
        if (number && number == route.short_name ||
            address && address == route.long_name) {
                agent.data.chosenRoute = route;
            const directions = buildStringFromList(agent.data.chosenRoute.directions,
                function (item) {
                    return item.schedule_items &&
                        item.schedule_items[0] &&
                        item.schedule_items[0].headsign ?
                        item.schedule_items[0].headsign : '';
                });
                agent.ask(`Which direction would you like to know about? Your choices are ${directions}`);
        }
    });
    agent.close(`Sorry, lookup failed`);
}