foam.CLASS({
  package: 'net.nanopay.merchant.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Merchant service client',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.auth.User',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  exports: [
    'deviceDAO',
    'transactionDAO',
    'userDAO'
  ],

  properties: [
    {
      name: 'users',
      factory: function () {
        return [
          'Simon Keogh',
          'Laurence Cooke',
          'Kent Rawlings',
          'Kirk Eaton',
          'Mae Kelly',
          'Gavin Harper',
          'Keith Pratt',
          'Josephine Brown',
          'Carlos Weaver',
          'Noah Andrews'
        ].map(function (name, i) {
          name = name.split(' ');
          return { id: i + 1, firstName: name[0], lastName: name[1], email: name[0] + '@mintchip.ca' };
        })
      }
    },
    {
      name: 'deviceDAO',
      factory: function () {
        return this.createDAO({
          of: this.Device,
          seqNo: true,
          testData: [
            {
              "name":"Ingenico 1",
              "type":2,
              "serialNumber":"D0905F62CBB44474",
              "status": this.DeviceStatus.ACTIVE,
              "password": 123456
            },
            {
              "name":"Ingenico 2",
              "type":2,
              "serialNumber":"D224E98C71EF42CA",
              "status": this.DeviceStatus.ACTIVE,
              "password": 123456
            },
            {
              "name":"Ingenico 3",
              "type":2,
              "serialNumber":"370D7D32C23F4CE6",
              "status": this.DeviceStatus.ACTIVE,
              "password": 123456
            }
          ]
        });
      }
    },
    {
      name: 'transactionDAO',
      factory: function () {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: this.users.map(function (user, i) {
            var refund = ( Math.random() >= 0.75 );
            var customer = Math.random() * (10 - 1) + 1;
            if ( customer === 1 ) customer++;

            var amount = (Math.random() * ( 3000 - 1 ) + 1).toFixed(0);
            var tip = ( amount * 0.15 ).toFixed(0);

            return {
              "id":i + 1,
              "payerId": ( refund ) ? 1 : customer,
              "payeeId": ( refund ) ? customer : 1,
              "amount": amount,
              "tip": tip,
              "date": Date.now()
            }
          })
        });
      }
    },
    {
      name: 'userDAO',
      factory: function () {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: this.users
        });
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO';
      config.cache = true;
      return this.EasyDAO.create(config);
    }
  ]
});