'use strict';

const nUrlManagementApiReadClient = require('@financial-times/n-url-management-api-read-client');

nUrlManagementApiReadClient.init({ metrics: {count: () => {}, histogram: () => {}} });

module.exports = nUrlManagementApiReadClient;
