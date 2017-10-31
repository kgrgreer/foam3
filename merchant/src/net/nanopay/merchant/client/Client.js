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
          'Noah Andrews',
          'Nellie Cox',
          'Alta Becker',
          'Louis Young',
          'Brent Higgins',
          'Chase Collier',
          'Jason Carpenter',
          'Evan Tucker',
          'Sallie Caldwell',
          'Minnie Greene',
          'Belle Henderson',
          'Oscar Jenkins',
          'Mildred Hodges',
          'Jane Wallace',
          'Gertrude Lyons',
          'Victoria Walker',
          'Mittie Burgess',
          'Lina Graham',
          'Eula Burns',
          'Micheal Pena',
          'Gordon Hanson',
          'Sue Maldonado',
          'Sophie Davidson',
          'Glenn Crawford',
          'Cody Ballard',
          'Eugene Reed',
          'Angel Bennett',
          'Elijah Goodman',
          'Angel Frazier',
          'Craig Gibson',
          'Annie Yates',
          'Elsie Copeland',
          'Lois Nelson',
          'Louise Reynolds',
          'Steve Lamb',
          'Walter Cunningham',
          'Fannie Nash',
          'Antonio Fox',
          'Earl Newton',
          'Frederick Taylor',
          'Henry Rodriquez',
          'Douglas Franklin',
          'Joshua Brewer',
          'Harriet Hines',
          'Gussie Duncan',
          'Essie Wilson',
          'Jon Martinez',
          'Lloyd Norris',
          'Evelyn Perez',
          'Bernice Yates',
          'Ellen Welch',
          'Gertrude Tyler',
          'Zachary McDaniel',
          'Jeff Poole',
          'Harriet Harper',
          'Ivan Reynolds',
          'Harold Townsend',
          'Mollie Gonzales',
          'Roy Black',
          'Bessie Farmer',
          'Vera Sutton',
          'Lloyd Bryant',
          'Bertie Williamson',
          'Elsie McCarthy',
          'Madge Anderson',
          'Eleanor Murray',
          'Jeremiah Cannon',
          'Mattie Colon',
          'Adrian Pope',
          'Jorge Griffith',
          'Charlotte Fields',
          'Edwin Cummings',
          'Isabelle Herrera',
          'Johanna Knight',
          'Bill Collier',
          'Pearl McKenzie',
          'Patrick Weber',
          'Ora Ramsey',
          'Cornelia Garrett',
          'Evelyn Lewis',
          'Blanche Cannon',
          'Clarence McGuire',
          'Angel Freeman',
          'Josephine Howard',
          'Shawn Dixon',
          'Nicholas Lawrence',
          'Janie Black',
          'Joel Glover',
          'Clifford Roy',
          'Etta Coleman',
          'Eliza Valdez',
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
            var customer = Math.random() * (100 - 1) + 1;
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