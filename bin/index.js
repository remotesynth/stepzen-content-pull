#!/usr/bin/env node
const pullContent = require('../lib/pullContent');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

let config_file;
if (argv.config) config_file = argv.config;
const configPath = path.resolve(process.cwd(), config_file || 'config.js');
const config = require(config_file);

pullContent.runQueries(config);
