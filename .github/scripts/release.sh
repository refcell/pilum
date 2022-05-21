#!/usr/bin/env bash
jsonFile=$1;

node > ${jsonFile} <<EOF
//Read data
var data = require('./${jsonFile}');

//Manipulate data
delete data.key3
data.name = '@abigger87/pilum';
data.publishConfig.registry = 'https://npm.pkg.github.com';

//Output data
console.log(JSON.stringify(data));

EOF
