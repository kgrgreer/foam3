foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.bank.CABankAccount'
  ],

  imports: [
    'accountDAO',
    'userDAO'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        // TODO: Use INSTANCE_OF mlang when it's fixed.
        var dao = this.accountDAO.where(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            this.BankAccount.NAME,
            this.BankAccount.OWNER,
            this.BankAccount.FLAG_IMAGE.clone().copyFrom({ tableWidth: 90 }),
            this.BankAccount.ACCOUNT_NUMBER.clone().copyFrom({ tableWidth: 120 }),
            this.BankAccount.STATUS.clone().copyFrom({ tableWidth: 110 }),
            foam.core.String.create({
              name: 'OwnerType',
              tableCellFormatter: function(value, obj) {
                self.userDAO.find(obj.owner).then((user) => {
                  this.add(user.cls_.name);
                });
              }
            })
          ]
        };
      }
    }
  ]
});
