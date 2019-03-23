foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'BusinessTransactionLimitRule',
  extends: 'net.nanopay.tx.ruler.AbstractTransactionLimitRule',

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
      javaCode: `return getSend() ? txn.findSourceAccount(x).findOwner(x).findGroup(x).getBusiness() :
      txn.findDestinationAccount(x).findOwner(x).findGroup(x).getBusiness();`
    }
  ]
});
