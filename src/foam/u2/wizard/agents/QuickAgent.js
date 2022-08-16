foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'QuickAgent',

  properties: [
    {
      class: 'Function',
      name: 'executeFn'
    }
  ],

  methods: [
    async function execute(x) {
      x = x || this.__subContext__;
      return await this.executeFn(x);
    }
  ]
});