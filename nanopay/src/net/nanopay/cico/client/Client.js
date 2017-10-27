foam.CLASS({
  package: 'net.nanopay.cico.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Bank Account Verification Service Client.',

  requires: [
    'foam.box.HTTPBox',
    'net.nanopay.model.BankAccount',
    'net.nanopay.cico.client.ClientBankAccountVerificationInterface'
  ],

  exports: [
    'bankAccountVerification'
  ],

  properties: [
    {
      name: 'bankAccountVerification',
      factory: function () {
        return this.ClientBankAccountVerificationInterface.create({
          delegate: this.HTTPBox.create({
            url: 'bankAccountVerification'
          })
        })
      }
    }
  ],

  methods: []
});
