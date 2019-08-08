foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ChangePropertyAction',

  documentation: `set the value of a field to the result of an expression`,

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'valueExpr'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        obj.setProperty(getPropName(),getValueExpr().f(x));
      `
    }
  ]
});
