'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { dialogflow } = require('actions-on-google');

const constants = require('./constants');

// Handlers
const welcome = require('./handlers/welcome');
const permission = require('./handlers/permission');
const route = require('./handlers/route');
const direction = require('./handlers/direction');
const confirm = require('./handlers/confirm');

const PORT = process.env.PORT || 5000;

const agent = dialogflow();

agent.intent(constants.intents.WELCOME, welcome.handler);
agent.intent(constants.intents.PERMISSION, permission.handler);
agent.intent(constants.intents.ROUTE, route.handler);
agent.intent(constants.intents.DIRECTION, direction.handler);
agent.intent(constants.intents.DIRECTION_FOLLOW, direction.follow);
agent.intent(constants.intents.CONFIRM, confirm.handler);
agent.intent(constants.intents.NO_SAVE, confirm.noSave);
agent.intent(constants.intents.SAVE, confirm.save);
agent.intent(constants.intents.CONFIRMATION, confirm.confirmation);


express().use(bodyParser.json(), agent).listen(PORT, () => console.log(`App listening on port ${PORT}!`));
