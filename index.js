'use strict';

var express = require('express');
const { DialogflowApp } = require('actions-on-google');

const PORT = process.env.PORT || 5000;

var app = express();

const constants = require('./constants');

const welcomeHandler = require('./handlers/welcomeHandler');
const permissionHandler = require('./handlers/permissionHandler');
const routeHandler = require('./handlers/routeHandler');
const directionHandler = require('./handlers/directionHandler');

app.post('/', function (req, res) {
  const actionMap = new Map();
  const agent = new DialogflowApp({request: req, response: res });

  actionMap.set(constants.WELCOME_ACTION, welcomeHandler.welcomeIntent);
  actionMap.set(constants.PERMISSION_ACTION, permissionHandler.permissionIntent);
  actionMap.set(constants.ROUTE_ACTION, routeHandler.routeIntent);
  actionMap.set(constants.DIRECTION_ACTION, directionHandler.directionIntent);

  agent.handleRequest(actionMap);
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`))
