foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.model.Account',
  forwardName: 'accounts',
  inverseName: 'owner'
});
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.model.Phone',
  forwardName: 'phones',
  inverseName: 'owner'
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.tx.model.TransactionLimit',
  forwardName: 'transactionLimits',
  inverseName: 'owner'
});