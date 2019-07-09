foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BankAccountDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  css: `
    ^ {
      background-color: #fafafa;
      border: 1px solid #e2e2e3;
      border-radius: 4px;
      margin-top: 8px;
    }

    ^ td {
      padding: 8px 16px;
    }

    ^ .foam-u2-PropertyView-label {
      font-weight: bold;
    }
  `,

  properties: [
    {
      name: 'properties',
      factory: function() {
        return [
          this.BankAccount.ID,
          this.BankAccount.OWNER,
          this.BankAccount.INSTITUTION,
          this.USBankAccount.BRANCH,
          this.CABankAccount.BRANCH,
          this.BankAccount.ACCOUNT_NUMBER,
          this.BankAccount.NAME,
          this.BankAccount.DENOMINATION,
          this.BankAccount.STATUS,
          this.BankAccount.MICRO_VERIFICATION_TIMESTAMP,
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
