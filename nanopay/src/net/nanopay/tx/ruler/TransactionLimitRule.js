foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  documentation: 'Abstract class for transaction limits, never to be instantiated. Meant to be extended' +
  'by models that would provide logic for getObjectToMap method. See example: AccountTransactionLimitRule.',

  javaImports: [
    'foam.core.X',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    // String array of accounts
    // Send or receive?
    // Period
    // Limit




    {
      name: 'name',
      visibility: 'RO',
      expression: function(limit, send, period) {
        return `${limit} ${send ? 'sending' : 'receiving'} ${period.label} transaction limit`;
      }
    },
    {
      class: 'String',
      name: 'ruleGroup',
      value: 'transactionLimits',
      visibility: 'RO',
      permissionRequired: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      value: 'CREATE',
      visibility: 'RO'
    },
    {
      class: 'Double',
      name: 'limit',
      label: 'Maximum transaction size',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['limit'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.tx.ruler.TransactionLimitRule.LIMIT, 0);
          },
          errorString: 'Please set a transaction limit.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'send',
      value: true,
      label: 'Apply limit to...',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [true, 'Sending'],
          [false, 'Receiving'],
        ]
      }
    },
    {
      class: 'String',
      name: 'transactionType',
      value: 'net.nanopay.tx.AbliiTransaction',
      label: 'Transaction Type',
      section: 'basicInfo',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          ['net.nanopay.tx.AbliiTransaction', 'Ablii Transaction'],
          ['null', 'Other Transaction'],
        ]
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'DAILY',
      label: 'Transaction limit time frame.'
    },
    {
      class: 'Map',
      name: 'currentLimits',
      visibility: 'RO',
      permissionRequired: true,
      javaFactory: `
        return new java.util.HashMap<Object, TransactionLimitState>();
      `,
      documentation: 'Stores map of objects and current running limits.'
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO',
    },
    {
      name: 'action',
      javaFactory: `
        return new TransactionLimitRuleAction.Builder(getX())
          .setSend(this.getSend())
          .setLimit(this.getLimit())
          .setPeriod(this.getPeriod())
          .setCurrentLimits(this.getCurrentLimits())
          .build();
      `,
    },
    {
      name: 'predicate',
      javaFactory: `
        return 
          foam.mlang.MLang.AND(
            foam.mlang.MLang.EQ(
              foam.mlang.MLang.DOT(
                foam.mlang.MLang.NEW_OBJ,
                net.nanopay.tx.model.Transaction.IS_QUOTED
              ),
              false
            )
            // foam.mlang.MLang.AND(
            //   foam.mlang.MLang.INSTANCE_OF(getTransactionType()), 
            //   foam.mlang.MLang.IN(net.nanopay.tx.model.Transaction.PAYEE, getAccounts())
            // )
          );
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
      return ret;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public void setX(X x) {
          this.x_ = x;
        };
        // finds an object to map. E.g., if limit is set per account, the method will return source/destination account'
        //when set per business, will return business.
        public abstract Object getObjectToMap(net.nanopay.tx.model.Transaction txn, foam.core.X x);
        `);
      }
    }
  ]
});
