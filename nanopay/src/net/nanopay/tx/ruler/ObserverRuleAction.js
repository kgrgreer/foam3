foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ObserverRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `This action implementation is responsible for changing values if a change in the observed property is detected
  `,

  javaImports: [
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      name: 'propertyToChange',
      class: 'String',
      value: 'return rule_.getPropertyToChange();'
    },
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        obj.getClassInfo().getAxiomByName(getPropertyToChange());
        getPropertyToChange().set(obj,rule_.getValueToSetExpression().f(x));
      `
    }
  ],
   axioms: [
      {
        name: 'javaExtras',
        buildJavaClass: function(cls) {
          cls.extras.push(`
              net.nanopay.tx.ruler.TransactionLimitRule rule_;
              public ObserverRuleAction(net.nanopay.tx.ruler.ObserverRule rule) {
                rule_ = rule;
              }
          `);
        }
      }
    ]
});
