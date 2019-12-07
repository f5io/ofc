const core = require('@ofc/core');
const pkg = require('../package.json');


const logo = (extra = '') => `
        ·▄▄▄ ▄▄· ▄▄ 
  ▪     ▐▄▄·▐█ ▌▪██▌
   ▄█▀▄ ██▪ ██ ▄▄▐█·
  ▐█▌.▐▌██▌.▐███▌.▀ 
   ▀█▄▀▪▀▀▀ ·▀▀▀  ▀     ${extra}
`;

const usage = () => logo('Usage: $0 [command] [env]');

const prodAlias = [ 'prod', 'production' ];

const run = (env, watch) => {
  const message = `I'm just building... hold up!`;

  console.log(logo(message));
  core.start({
    watch,
    production: prodAlias.includes(env),
  });
};

const program = require('yargs')
  .usage(usage())
  .alias('h', 'help')
  .command({
    command: 'watch [env]',
    aliases: [ 'w', '$0' ],
    desc: 'build and serve the current directory',
    builder: yargs => yargs.default('env', 'development'),
    handler: argv => run(argv.env, true),
  })
  .command({
    command: 'build [env]',
    aliases: [ 'b' ],
    desc: 'build the current directory',
    builder: yargs => yargs.default('env', 'development'),
    handler: argv => run(argv.env, false),
  })
  .help();

module.exports = () => program.argv;
