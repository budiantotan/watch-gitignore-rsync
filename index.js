#!/usr/bin/env node

const debounce = require('lodash/debounce');
const chokidar = require('chokidar');
const { getExcludedRegex, getExcludedArguments } = require('./excludeUtil');
const { rsync } = require('./rsync');

const args = require('yargs')
  .usage('Usage: watch-rsync --destination="path/to/remote"')
  .demandOption(['destination'])
  .option('debounce', {
    alias: 'd',
    default: 1000,
    description: 'Debounce duration in ms'
  })
  .option('include', {
    alias: 'i',
    default: '',
    description: 'Path/file to include for watching (comma separated). It should be in regular expression, glob or string'
  })
  .option('rsync-opt', {
    default: '-avz --delete-after --ignore-missing-args',
    description: 'Options when running rsync'
  })
  .boolean('verbose')
  .describe('verbose', 'Enable verbose output')
  .boolean('ignoreInitial')
  .describe('ignore-initial', 'Disable initial rsync before watching')
  .argv

// main process
const source = '.';
const included = args.include.split(',').map(include => include.trim());
const ignored = getExcludedRegex(source, included);
const excludeArguments = getExcludedArguments(source, included);

const watcher = chokidar.watch(source, {
  ignored,
  ignoreInitial: true,
})

const startSync = () =>
  rsync(args.verbose, source, args.destination, args["rsync-opt"], excludeArguments);

const startWatch = () => {
  console.log('Watching files ....');
  watcher.on('all', debounce(function (event, path) {
    if (args.verbose) {
      console.log(`Watch event triggered: ${event}: ${path}`)
    } else {
      console.log('Change detected!')
    }
    startSync()
  }, args.debounce));
}

// Sync first before watch
if (!args["ignore-initial"]) {
  console.log('Start initial sync');
  startSync().then(startWatch).catch(e => console.error(e));
} else {
  startWatch();
}

