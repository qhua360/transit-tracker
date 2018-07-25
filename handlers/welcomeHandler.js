const Permission = require('actions-on-google');

exports.welcomeIntent = function(agent) {
    agent.ask(new Permission({
        context: 'Hi there',
        permissions: 'DEVICE_PRECISE_LOCATION',
    }));
}