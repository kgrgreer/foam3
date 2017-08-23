foam.CLASS({
  package: 'net.nanopay.retail.dao',
  name: 'Storage',

  documentation: 'Creates all Retail DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'net.nanopay.retail.model.Merchant',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.BankAccount',
    'net.nanopay.retail.model.Transaction'
  ],

  exports: [
    'merchantDAO',
    'deviceDAO',
    'bankAccountDAO',
    'transactionDAO'
  ],

  properties: [
    {
      name: 'merchantDAO',
      factory: function() {
        return this.createDAO({
          of: this.Merchant,
          seqNo: true
        })
      }
    },
    {
      name: 'deviceDAO',
      factory: function() {
        return this.createDAO({
          of: this.Device,
          seqNo: true,
          testData: [
            {
              name: 'Ingenico 1', type: 'Terminal', serialNumber: '7D0F5AP3VU529LA', status: 'Active'
            },
            {
              name: 'Ciao Tablet', type: 'Android', serialNumber: '59GS8F8A3L5FAQ1', status: 'Pending'
            },
            {
              name: 'Merci Pad', type: 'iPad', serialNumber: '0A3H70K5HLA82E4', status: 'Disabled'
            }
          ]
        })
        .addPropertyIndex(this.Device.NAME)
        .addPropertyIndex(this.Device.TYPE)
        .addPropertyIndex(this.Device.SERIAL_NUMBER)
        .addPropertyIndex(this.Device.STATUS)
      }
    },
    {
      name: 'bankAccountDAO',
      factory: function() {
        return this.createDAO({
          of: this.BankAccount,
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
    },
    {
      name: 'transactionDAO',
      factory: function() {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: [
              {
                id: 1, dateAndTime: 'July 4th 2017', type: 'Sales', customer: 'Tywin Lannister', server: 'Joffrey Baratheon', tip: 5.00, total: 25.00, device: 'Android'
              },
              {
                id: 2, dateAndTime: 'July 5th 2017', type: 'Sales', customer: 'Sansa Stark', server: 'Lord Varys', tip: 15.00, total: 115.00, device: 'Ingenico 1'
              },
              {
                id: 3, dateAndTime: 'July 6th 2017', type: 'Sales', customer: 'Petyr Baelish', server: 'Walder Frey', tip: 3.50, total: 13.50, device: 'iPad'
              },
              {
                id: 4, dateAndTime: 'July 7th 2017', type: 'Sales', customer: 'Sandor Clegane', server: 'Oberyn Martell', tip: 23.00, total: 223.00, device: 'iPhone'
              }
          ]
        })
        .addPropertyIndex(this.Transaction.DATE_AND_TIME)
        .addPropertyIndex(this.Transaction.TYPE)
        .addPropertyIndex(this.Transaction.CUSTOMER)
        .addPropertyIndex(this.Transaction.SERVER)
        .addPropertyIndex(this.Transaction.TIP)
        .addPropertyIndex(this.Transaction.TOTAL)
        .addPropertyIndex(this.Transaction.DEVICE)
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
