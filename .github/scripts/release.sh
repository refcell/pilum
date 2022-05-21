#!/usr/bin/env bash

# Generate a new package.json with github registry config
node > new_package.json <<EOF
// Read data
var data = require('./package.json');

// Update package registry info
data.name = '@abigger87/pilum';
data.publishConfig.registry = 'https://npm.pkg.github.com';

// Output data
console.log(JSON.stringify(data));

EOF

# Replace the package.json contents
cat new_package.json > package.json

