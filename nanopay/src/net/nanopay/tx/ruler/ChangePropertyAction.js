foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ChangePropertyAction',

  documentation: `set the value of a field to the result of an expression`,

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      name: 'changeProperty',
      class: 'String'
    },
    {
      name: 'to',
      class: 'foam.mlang.ExprProperty'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        obj.setProperty(getChangeProperty(),getTo().f(x));
      `
    }
  ]
});
