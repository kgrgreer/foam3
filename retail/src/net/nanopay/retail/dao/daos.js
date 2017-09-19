foam.CLASS({
  package: 'net.nanopay.retail.dao',
  name: 'Storage',

  documentation: 'Creates all Retail DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.retail.model.BankAccount'
  ],

  exports: [
    'bankAccountDAO'
  ],

  properties: [
    {
      name: 'bankAccountDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.BankAccount,
          cache: true,
          seqNo: true,
          testData: [
              {
                id: 0, accountName: 'Scotiabank Chequing', bankNumber: '002', transitNumber: 40193, accountNumber: '1234567890', status: 'Verified'
              },
              {
                id: 1, accountName: 'Scotiabank Savings', bankNumber: '002', transitNumber: 19087, accountNumber: '2345678901', status: 'Unverified'
              },
              {
                id: 2, accountName: 'TD Savings', bankNumber: '004', transitNumber: 32142, accountNumber: '3456789012', status: 'Verified'
              }

          ]
        })
        .addPropertyIndex(this.BankAccount.ID)
        .addPropertyIndex(this.BankAccount.ACCOUNT_NAME)
        .addPropertyIndex(this.BankAccount.BANK_NUMBER)
        .addPropertyIndex(this.BankAccount.TRANSIT_NUMBER)
        .addPropertyIndex(this.BankAccount.ACCOUNT_NUMBER)
        .addPropertyIndex(this.BankAccount.STATUS)
      }
    }
  ]
});
