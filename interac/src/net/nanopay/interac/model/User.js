foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.interac.model.Payee',
  forwardName: 'payees',
  inverseName: 'payer'
});