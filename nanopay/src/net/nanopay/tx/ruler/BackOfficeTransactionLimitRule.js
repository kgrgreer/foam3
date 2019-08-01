foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'BackOfficeTransactionLimitRule',
    extends: 'net.nanopay.tx.ruler.TransactionLimitRule',
    sections: [
      {
        name: 'accounts',
        order: 500
      }
    ],

    imports: [
        'accountDAO'
    ],

    implements: [
        'foam.mlang.Expressions'
    ],

    properties: [
      {
        name: 'predicate',
        label: '',
        section: 'accounts',
        view: function(_, x) {
          var prop = this;
          return {
            class: 'net.nanopay.tx.ui.BackOfficeTransactionLimitRulePredicateView',
          }
        }
      }
    ],
  
    methods: [
      {
        name: 'getObjectToMap',
        type: 'Object',
        args: [
          {
            name: 'txn',
            type: 'net.nanopay.tx.model.Transaction'
          },
          {
            name: 'x',
            type: 'foam.core.X'
          }
        ],
        javaCode: 'return getSend() ? txn.getSourceAccount() : txn.getDestinationAccount();'
      }
    ]
  });
  