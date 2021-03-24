foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CustomBankAccountsBorder',
  extends: 'foam.u2.Element',
  documentation: `
    A border which restricts bankAccountDAO to only custom bank accounts.
  `,

  imports: [ 'subject' ],
  exports: [ 'bankAccountDAO' ],

  properties: [
    {
      name: 'bankAccountDAO',
      factory: function() {
        return this.subject.user.accounts
          .where(this.INSTANCE_OF(this.BankAccount))
          .orderBy(this.BankAccount.CREATED);
      }
    }
  ]
});
