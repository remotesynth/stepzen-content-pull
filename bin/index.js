#!/usr/bin/env node
const pullContent = require('../lib/pullContent');
const argv = require('minimist')(process.argv.slice(2));

let config_file = '../config.js';
if (argv.config) config_file = argv.config;
const config = require(config_file);

pullContent.runQueries(config);
