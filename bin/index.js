#!/usr/bin/env node
const pullContent = require('../lib/pullContent');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
require('dotenv').config();

let config_file;
let apiKey = process.env.STEPZEN_API_KEY;
if (argv.config) config_file = argv.config;
if (argv.apikey) apiKey = argv.apikey;
const configPath = path.resolve(process.cwd(), config_file || 'config.js');
const config = require(configPath);

pullContent.runQueries(config, apiKey);
