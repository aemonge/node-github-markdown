#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const pify = require('pify');
const minimist = require('minimist');
const globby = require('globby');
const getStdin = require('get-stdin');
const ghmd = require('.');

const fsP = pify(fs);
let title = 'Markdown Built with github-markdown';
const argv = minimist(process.argv.slice(2), {
  alias: {
    d: 'dest',
    t: 'template',
    h: 'help',
    v: 'version'
  }
});

if (argv.v || argv.version) {
  process.stdout.write(require(`${__dirname}/package`).version + '\n');
  process.exit();
} else if (argv.h || argv.help) {
  process.stdout.write(fs.readFileSync(`${__dirname}/usage.txt`));
  process.exit();
}

if (argv.title && typeof argv.title === 'string') {
  title = argv.title;
}


if (argv.stdin) {
  getStdin().then(string => {
    process.stdout.write(ghmd(string, {
      template: argv.template, title
    }));
  });
} else {
  globby(argv._).then(inputs => {
    const dest = argv.dest ? path.dirname(argv.dest) : process.cwd();

    for (const input of inputs) {
      const output = path.resolve(dest, `${path.basename(input, '.md')}.html`);
      convert(input, argv.template, output);
    }
  });
}

function convert(input, template, output) {
  return fsP.readFile(input)
    .then(buffer => buffer.toString())
    .then(markdown => ghmd(markdown, {template, title}))
    .then(html => fsP.writeFile(output, html));
}
