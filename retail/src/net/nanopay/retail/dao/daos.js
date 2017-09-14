foam.CLASS({
  package: 'net.nanopay.retail.dao',
  name: 'Storage',

  documentation: 'Creates all Retail DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.BankAccount'
  ],

  exports: [
    'deviceDAO',
    'bankAccountDAO'
  ],

  properties: [
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
