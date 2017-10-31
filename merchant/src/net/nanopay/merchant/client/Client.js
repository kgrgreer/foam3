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
    'net.nanopay.tx.model.Transaction'
  ],

  exports: [
    'deviceDAO',
    'transactionDAO',
    'userDAO'
  ],

  properties: [
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
              "serialNumber":"D224E98C71EF42CA",
              "status":1,
              "password":123456
            },
            {
              "name":"Ciao Tablet",
              "type":1,
              "serialNumber":"59GS8F8A3L5FAQ1",
              "status":1,
              "password":123456
            },
            {
              "name":"Merci Pad",
              "type":0,
              "serialNumber":"0A3H70K5HLA82E4",
              "status":2,
              "password":123456
            }
          ]
        });
//        return this.RequestResponseClientDAO.create({
//          of: this.Device,
//          delegate: this.HTTPBox.create({
//            method: 'POST',
//            url: 'http://localhost:8080/deviceDAO'
//          })
//        });
      }
    },
    {
      name: 'transactionDAO',
      factory: function () {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
        });
//        return this.RequestResponseClientDAO.create({
//          of: this.Transaction,
//          delegate: this.HTTPBox.create({
//            method: 'POST',
//            url: 'http://localhost:8080/transactionDAO'
//          })
//        });
      }
    },
    {
      name: 'userDAO',
      factory: function () {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: [
            {
              "firstName":"Simon",
              "middleName":"",
              "lastName":"Keogh",
              "organization":"",
              "department":"",
              "email":"simon@gmail.com",
              "phone":"+1-4169001111",
              "mobile":"", "type":"",
              "birthday":"1982-07-07T23:12:00.0Z",
              "address":{
                "class":"foam.nanos.auth.Address",
                "type":"",
                "verified":false,
                "deleted":false,
                "address":"666 GitHub Boulevard",
                "suite":"300",
                "city":"Toronto",
                "postalCode":"M6G2H3",
                "countryId":"CA",
                "regionId":"ON",
                "encrypted":false
              },
              "accounts":[],
              "language":"en",
              "timeZone":"",
              "password":"22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d",
              "previousPassword":"",
              "note":""
            }
          ]
        });
//        return this.RequestResponseClientDAO.create({
//          of: this.User,
//          delegate: this.HTTPBox.create({
//            method: 'POST',
//            url: 'http://localhost:8080/userDAO'
//          })
//        });
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