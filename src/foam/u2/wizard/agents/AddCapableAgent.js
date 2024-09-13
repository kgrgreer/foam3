/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AddCapableAgent',
  implements: ['foam.core.ContextAgent'],

  documentation: `
    Context agent that exports some data as the capable object for all subsequent wizardlets, 
    helpful when configuring capable object wizards that require information about the object and it's subsequent payloads
  `,

  requires: [
    'foam.u2.wizard.data.NullLoader',
    'foam.u2.wizard.data.ProxyLoader'
  ],

  imports: [
    'capable? as importedCapable'
  ],
  exports: ['capable'],

  properties: [
    {
      name: 'capable'
    },
    {
      name:'loader',
      class: 'foam.util.FObjectSpec'
    }
  ],

  methods: [
    async function execute(x) {
      if ( this.importedCapable )
        console.warn('Replacing capable object in wizard context');
      const loader = foam.json.parse(this.loader, undefined, x || this.__subContext__);
      foam.u2.wizard.data.ensureTerminal(loader, this.ProxyLoader, this.NullLoader);
      this.capable = await loader?.load({});
      return x;
    }
  ]
});
