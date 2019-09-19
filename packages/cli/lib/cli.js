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

const run = (env, serve) => {
  const message = serve
    ? `Shit's gonna be happening on http://0.0.0.0:3000`
    : `I'm just building... hold up!`;

  console.log(logo(message));
  core.start({
    serve,
    production: prodAlias.includes(env),
  });
};

const program = require('yargs')
  .usage(usage())
  .alias('h', 'help')
  .command({
    command: 'serve [env]',
    aliases: [ 's', '$0' ],
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
