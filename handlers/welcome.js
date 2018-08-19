const { Permission } = require('actions-on-google');

var welcome = module.exports = {}

welcome.handler = (conv) => {
    conv.ask(new Permission({
        context: 'Hi there',
        permissions: 'DEVICE_PRECISE_LOCATION',
    }));
}
