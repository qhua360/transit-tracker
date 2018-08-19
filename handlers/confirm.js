const { Confirmation } = require('actions-on-google');

var confirm = module.exports = {}

confirm.handler = (conv) => {
    conv.ask(new Confirmation('Confirm saving ' + conv.data.chosenRoute + ' to ' + conv.data.chosenDirection + ' as your favorite?'));
}

confirm.noSave = (conv) => {
    conv.close(`Have a nice day!`);
}

confirm.save = (conv) => {
    conv.ask(new Confirmation(savePhrase));
}

confirm.confirmation = (conv, params, confirmationGranted) => {
    if (confirmationGranted) {
        conv.user.storage.chosenRoute = conv.data.chosenRoute;
        conv.user.storage.chosenDirection = conv.data.chosenDirection;
    }
    conv.close(`Have a nice day!`);
}
