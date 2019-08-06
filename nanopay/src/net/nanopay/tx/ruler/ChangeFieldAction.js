foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ChangeFieldAction',

  documentation: `set the value of a field to the result of an expression`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
  ],
  properties: [
    {
      name: 'changeProperty',
      class: 'String'
    },
    {
      name: 'to',
      class: 'Expression'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        FObject nu  = (FObject) obj;
        nu.getClassInfo().getAxiomByName(getChangeProperty()).set(getTo());
      `
    }
  ]
});
