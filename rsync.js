const { exec } = require('child_process');

module.exports.rsync = (verbose, source, destination, opts, excludeArgs) => {
  // sanitation
  const s = source.endsWith('/') ? source : `${source}/`
  const d = destination.endsWith('/') ? destination : `${destination}/`

  return new Promise((resolve, reject) => {
    exec(
      `rsync -e ssh ${opts} ${s} ${d} ${excludeArgs}`,
      {maxBuffer: 1024 * 5000},
      (error, stdout, stderr) => {
        if (stderr || error) {
          reject(`Exec rsync error: ${stderr || error}`);
        }
        if (verbose) {
          console.log(stdout);
        } else {
          console.log('Done rsync-ing');
        }
        resolve();
      }
    );
  })
}

