foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AccountTransactionLimitRule',
  extends: 'net.nanopay.tx.ruler.TransactionLimitRule',
  sections: [
    {
      name: 'accounts',
      order: 500
    }
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
            .start({
              class: 'net.nanopay.tx.ui.AccountTransactionLimitRulePredicateView',
              daoKey: 'accountDAO',
              data$: data$,
            })
              .call(function() { this.fromProperty && this.fromProperty(prop) })
            .end()
          .end()
          .start(foam.u2.Tab, { label: 'JSON' })
            .start({
              class: 'foam.u2.view.JSONTextView',
              rows: 20,
              data$: data$,
            })
              .call(function() { this.fromProperty && this.fromProperty(prop) })
            .end()
          .end();
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
