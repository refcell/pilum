#!/usr/bin/env bash
node > package.json <<EOF
//Read data
var data = require('./package.json');

//Manipulate data
data.name = '@abigger87/pilum';
data.publishConfig.registry = 'https://npm.pkg.github.com';

//Output data
console.log(JSON.stringify(data));

EOF
