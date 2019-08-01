foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ObserverRule',
  extends: 'foam.nanos.ruler.Rule',
  //abstract: true,

  documentation: 'Abstract class for Observer Rules, never to be instantiated. Meant to be extended' +
  'by models that would provide logic for getObjectToMap method. See example: AccountTransactionLimitRule.',

  javaImports: [
    'foam.core.X'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'String',
      name: 'ruleGroup',
      value: 'ObserverRules',
      visibility: 'RO',
      permissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'UPDATE',
      visibility: 'RO'
    },
    {
      name: 'daoKey'
    },
    {
      name: 'after',
      class: 'boolean',
      javaFactory: 'return true;'
    },
    {
      name: 'action',
      javaFactory: `
      return new ObserverRuleAction(propertyToChange,valueToSetExpression);
      `,
    },
    {
      name: 'objectClass',
      class: 'Class'
    },
    }
    {
      name: 'observedProperty',
      class: 'String',
    },

    {
      name: 'propertyToChange',
      class: 'String',
    },
    {
      name: 'valueToSetExpression',
      class: 'foam.mlang.ExprProperty',
      //validate that object can cast to value of propertyToChange.value
    },


    {
      name: 'predicate',
      javaFactory: `
        return
        foam.mlang.MLang.AND(
        foam.mlang.MLang.INSTANCE_OF(getObjectClass()),
        foam.mlang.MLang.NEQ(
          foam.mlang.MLang.DOT(
            foam.mlang.MLang.NEW_OBJ,
            Transaction.getOwnClassInfo().getAxiomByName(observedProperty)),
            foam.mlang.MLang.DOT(
            foam.mlang.MLang.OLD_OBJ,
            Transaction.getOwnClassInfo().getAxiomByName(observedProperty))));
      `
    }
  ],

  methods: [
    {
      name: 'updateLimitAmount',
      args: [
        {
          name: 'amount',
          type: 'Double'
        },
        {
          name: 'msPeriod',
          type: 'Long'
        }
      ],
      type: 'Double',
      javaCode: `
      return Math.max(amount - msPeriod * getLimit() / getPeriod().getMs(), 0);
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      TransactionLimitRule ret = (TransactionLimitRule) rule.fclone();
      if ( ret.getSend() != getSend() ) {
        throw new RuntimeException("send property cannot be changed");
      }
      ret.clearAction();
      ret.setCurrentLimits(getCurrentLimits());
      return ret;
      `
    }
  ]
});
