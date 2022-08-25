/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.development',
  name: 'ClientTestingReplayDAO',
  extends: 'foam.classloader.OrDAO',
  javaExtends: '',
  documentation: `
    /!\ warning: production use not advised /!\

    A DAO decorator for use in development to load jrl files in the client.
    Note: this will override existing objects on the server.


    <h2>Context:</h2>
    We have "TestWizardScenario" objects which are a model with an array of
    capabilities and prerequisite junctions. These are the "test wizards" that
    show up in a menu when you have the developer capability. These are
    convenient because we don't need to run the build script every time we
    change something in the wizard. (which, since it's a UI result, you'd want
    to do often to see the result). This causes issues when a capability
    hierarchy exists both in a test file and journals, because they both need
    to be kept in sync. Replaying journals at runtime is an option but requires
    build system support for redeploying journals, as well as backend support
    for invoking the behaviour. This DAO decorator avoids that complication by
    doing a "replay" on the client onto an ArrayDAO.
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
