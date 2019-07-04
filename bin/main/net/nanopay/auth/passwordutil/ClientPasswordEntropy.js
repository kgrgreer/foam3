foam.CLASS({
  package: 'net.nanopay.auth.passwordutil',
  name: 'ClientPasswordEntropy',

  implements: [
    'net.nanopay.auth.passwordutil.PasswordEntropy'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.auth.passwordutil.PasswordEntropy',
      name: 'delegate'
    }
  ]
});
