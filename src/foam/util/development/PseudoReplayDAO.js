/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.development',
  name: 'PseudoReplayDAO',
  extends: 'foam.classloader.OrDAO',
  javaExtends: '',
  documentation: `
    /!\ warning: production use not advised /!\

    A development DAO decorator to load jrl files in the client.
    Note: this will override existing objects on the server.
  `,

  requires: [
    'foam.dao.ArrayDAO'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'initialized',
    },
    {
      class: 'StringArray',
      name: 'journals'
    },
    {
      name: 'primary',
      expression: function (of) {
        return this.ArrayDAO.create({ of });
      }
    }
  ],

  methods: [
    async function find_(...a) {
      if ( ! this.initialized ) this.initialize();
      return await this.SUPER(...a);
    },
    async function select(...a) {
      if ( ! this.initialized ) this.initialize();
      return await this.SUPER(...a);
    },
    async function initialize () {
      // syntax highlighter may say 'path' is unused; this is inaccurate.
      for ( const path of this.journals ) with ({
        p: spec => {
          const o = foam.json.parse(spec, this.of, this.__subContext__);
          this.primary.put(o);
        },
        r: spec => {
          const o = foam.json.parse(spec, this.of, this.__subContext__);
          this.primary.remove(o);
        }
      }) eval(await (await fetch(path)).text());
    }
  ]
});
