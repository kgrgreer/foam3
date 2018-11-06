foam.CLASS({
  package: 'net.nanopay.sme.passwordutil',
  name: 'ClientPasswordEntropy',

  implements: [
    'net.nanopay.sme.passwordutil.PasswordEntropy'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.sme.passwordutil.PasswordEntropy',
      name: 'delegate'
    }
  ]
});
