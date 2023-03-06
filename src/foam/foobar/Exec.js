/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'Exec',
  implements: ['foam.core.ContextAgent'],
  flags: ['node'],

  nodeRequires: [
    'path as path_'
  ],

  imports: [
    'args as parentArgs',
    'console'
  ],

  properties: [
    {
      name: 'spawn_',
      factory: () => require('node:child_process').spawn
    },
    {
      class: 'String',
      name: 'shell',
      factory: () => process.argv[0]
    },
    {
      class: 'String',
      name: 'path',
      required: true,
      adapt: function (_, n) {
        return this.path_.normalize(n)
      }
    },
    {
      class: 'Boolean',
      name: 'passParentArgs'
    },
    {
      class: 'Array',
      name: 'args',
      getter: function () {
        return [
          ...( this.passParentArgs && this.parentArgs || [] ),
          ...( this.instance_.args && this.instance_.args || [] )
        ];
      }
    },
    {
      class: 'Map',
      name: 'env',
      getter: function () {
        return {
          ...process.env,
          ...(this.instance_.env || {})
        }
      }
    }
  ],

  methods: [
    async function execute () {
      const spawnArgs = [null, null, {
        ...(this.env ? { env: this.env } : {})
      }];
      if ( this.shell ) {
        spawnArgs[0] = this.shell;
        spawnArgs[1] = [this.path];
      } else {
        spawnArgs[0] = this.path;
        spawnArgs[1] = [];
      }
      if ( this.passParentArgs ) spawnArgs[1].push(...this.parentArgs);
      spawnArgs[1].push(...this.args);
      console.log(`┏┫${spawnArgs[0]} ${spawnArgs[1].join(' ')}┃`);
      const child = this.spawn_(...spawnArgs);
      return await new Promise((rslv, rjct) => {
        child.on('close', code => {
          this.console.log(`┗┫EXIT ${code}┃\n`)
          if ( code === 0 ) {
            rslv(code);
          } else {
            rjct(code);
          }
        })
        child.stdout.on('data', data => {
          this.console.log(this.formatOutput(data.toString()));
        })
        child.stderr.on('data', data => {
          this.console.log(this.formatOutput(data.toString(), true));
        })
      });
    },
    function formatOutput (str, isStderr) {
      let bar = isStderr ? '\033[34;1m┃\033[0m' : '┃';
      return str.trim().split('\n').map(l => bar + ' ' + l).join('\n');
    }
  ]
});
