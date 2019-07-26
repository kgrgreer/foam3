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
          var data$ = x.data.slot(prop.name);
          return foam.u2.Tabs.create(null, x)
            .start(foam.u2.Tab, { label: 'Select'})
              .style({
                'padding-top': '20px',
              })
              .tag({
                class: 'net.nanopay.tx.ui.BackOfficeTransactionLimitRulePredicateView',
                data$: data$
              })
            .end()
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
  