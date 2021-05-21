foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.interac.model.Payee',
  forwardName: 'payees',
  inverseName: 'payer',
  sourceProperty: {
    section: 'accountInformation'
  }
});

//foam.RELATIONSHIP({
//  sourceModel: 'foam.nanos.auth.User',
//  targetModel: 'net.nanopay.interac.model.Identification',
//  forwardName: 'identification',
//  inverseName: 'owner'
//});