foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BankAccountDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.BankAccount.ID,
          this.BankAccount.NAME,
          this.BankAccount.ACCOUNT_NUMBER,
          this.USBankAccount.BRANCH,
          this.CABankAccount.BRANCH,
          this.BankAccount.INSTITUTION,
          this.BankAccount.OWNER,
          this.BankAccount.DENOMINATION,
          this.BankAccount.STATUS,
          this.BankAccount.MICRO_VERIFICATION_TIMESTAMP,
          this.BankAccount.VERIFICATION_ATTEMPTS,
          this.BankAccount.CREATED_BY,
          this.BankAccount.CREATED,
          this.BankAccount.CREDITS,
          this.BankAccount.DEBITS,
          this.BankAccount.FLINKS_RESPONSES,
          this.BankAccount.PLAID_RESPONSES
        ];
      }
    }
  ]
});
