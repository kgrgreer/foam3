foam.RELATIONSHIP({
  package: 'net.nanopay.security',
  sourceModel: 'net.nanopay.security.PublicKeyEntry',
  targetModel: 'net.nanopay.security.KeyRight',
  forwardName: 'conditions',
  inverseName: 'keyRight',
  cardinality: '1:*',
});

foam.RELATIONSHIP({
  package: 'net.nanopay.account',
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.security.PublicKeyEntry',
  forwardName: 'keys',
  inverseName: 'account',
  cardinality: '1:*',
});
