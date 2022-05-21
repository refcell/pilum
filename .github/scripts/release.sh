#!/usr/bin/env bash

ls -lsa

node <<EOF
// Read data
var data = require('./package.json');
console.log('Reade package.json');
console.log(data);

// Update package registry info
data.name = '@abigger87/pilum';
data.publishConfig.registry = 'https://npm.pkg.github.com';

console.log('Updated variables in package.json');

// Output data
console.log(JSON.stringify(data));

EOF



node > package.json <<EOF
// Read data
var data = require('./package.json');

// Update package registry info
data.name = '@abigger87/pilum';
data.publishConfig.registry = 'https://npm.pkg.github.com';

// Output data
console.log(JSON.stringify(data));

EOF
