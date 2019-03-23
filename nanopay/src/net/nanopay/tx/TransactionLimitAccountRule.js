foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitAccountRule',
  extends: 'net.nanopay.tx.TransactionLimitRule',

  methods: [
    {
      name: 'getMappedId',
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
      type: 'long',
      javaCode: 'return getSend() ? txn.findSourceAccount(x).getId() : txn.findDestinationAccount(x).getId();'
    }
  ]
});
