#!/usr/bin/env node
const chalk = require('chalk');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const SvgSprite = require('./utils/svg-sprite');

const outputDir = path.join(process.cwd(), 'svg-sprite-out');

const args = yargs
  .option('verbose', {
    alias: 'v',
    default: false,
  })
  .option('input', {
    alias: 'i',
    default: '',
    description: 'input directory',
  })
  .option('output', {
    alias: 'o',
    default: outputDir,
    description: 'output directory',
  })
  .demandOption(['i'])
  .usage('$0 --input <input directory> --output <output directory>')
  .usage('$0 --i <input directory> --o <output directory>')
  .example('$0 --input /svgs/ --output /svgsprite/')
  .example('$0 --i /svgs/ --o /svgsprite/')
  .example('$0 --i /svgs/')
  .argv;

if (args.i === '' || !fs.existsSync(args.i)) {
  console.log(chalk.red('Missing input directory: i'));
  process.exit(1);
}


if (!fs.existsSync(args.output)) {
  fs.mkdirSync(args.output);
}

console.log(chalk.yellow.bold('> Creating the SVG Sprite'));

const sprite = new SvgSprite(args.output);

console.log(chalk.green(`> getting all svgs files from path ${args.input} `));
sprite.createNewSprite([args.input]);
