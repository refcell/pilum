#!/usr/bin/env bash

ls -lsa

node > package.json <<EOF
//Read data
var data = require('./package.json');

//Manipulate data
data.name = 'pilum';
data.publishConfig.registry = 'https://registry.npmjs.org/';

//Output data
console.log(JSON.stringify(data));

EOF
