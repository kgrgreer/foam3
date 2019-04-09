foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportPage1',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'stack',
    'user',
    'xeroService',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.resultresponse.ContactErrorItem',
    'foam.dao.EasyDAO'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
      text-align: center
    }
    ^ .report-container {
      display: inline-block;
      width: 100%;
      height: 90vh;
    }
    ^ .button-bar {
      margin-top:20px;
      height: 48px;
      background-color: #ffffff;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 24px;
    }
    ^ .net-nanopay-ui-ActionView-next {
      width: 158px;
      height: 48px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 14px !important;
      font-weight: 400;
      float:right;
      color: #FFFFFF !important;
    }
    ^ .net-nanopay-ui-ActionView-next:hover {
      background-color: #4d38e1 !important;
    }
    ^ .title {
      font-size: 24px;
      font-weight: 900;
      color: black;
      margin-top: 24px;
    }
    ^ .checkmark-img {
      margin-top: 120px;
    }
    
    ^ .report-table-container {
      max-height: 500px;
      width: 677px;
      margin-top: 25px;
      margin-left: auto; margin-right: auto;
      overflow: hidden;
    }
    
    ^ .report-title-2 {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 80px;
    }
    
    ^ .report-title-2 p {
      font-size: 16px;
      font-weight: 900;
      line-weight: 1.5
    }
    
    ^ .report-title-img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    
    ^ .report-title-3 {
      font-size: 14px;
    }
  `,

  messages: [
    { name: 'SuccessMessage', message: 'Successfully synced contacts and invoices' },
    { name: 'EXISTING_CONTACT', message: 'existing contact'},
    { name: 'EXISTING_USER', message: 'existing user'},
    { name: 'EXISTING_USER_MULTI', message: 'existing user belong to multiple business'},
    { name: 'EXISTING_USER_CONTACT', message: 'existing user also contact'},
  ],

  properties: [
    'reportResult',
  ],

  methods: [
    function initE() {
      this
        .start().addClass(this.myClass())

          .start().addClass('report-container')

            .start('img').addClass('checkmark-img')
              .attrs({ src: 'images/checkmark-large-green.svg' })
            .end()
            .start('h1').add(this.SuccessMessage).addClass('title').end()

            .start('div').addClass('report-title-2')
              .start('img').addClass('report-title-img')
                .attrs({ src: 'images/ablii-logo.svg' })
              .end()
              .start('p').add('Found Ablii users from your synced contacts!').end()
            .end()

            .start('p').addClass('report-title-3')
              .add('You can send or request money right away to these contacts')
            .end()

        .start('div').addClass('report-table-container')
            .start().tag({
              class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initMismatchData(), columns: ['name','businessName', 'message'], header:'Ablii users'
            }).end()
        .end()

          .end()

          .start().addClass('button-bar')
            .start(this.NEXT).end()
          .end()

        .end();
    },

    function initMismatchData() {
      let myData = this.reportResult.contactSyncMismatches;
      //let myData = this.temp();
      let myDAO = foam.dao.MDAO.create( {of: this.ContactErrorItem} );

      for ( x in myData ) {
        myDAO.put(this.ContactErrorItem.create({
          id: x,
          businessName: myData[x].existContact.businessName,
          name: myData[x].existContact.firstName + " " + myData[x].existContact.lastName,
          message: this[myData[x].resultCode.name]
        }))
      }

      return myDAO;
    },

    // TODO remove it
    function temp() {
      return [
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "86",
            "realmId": "123146320035089",
            "organization": "BBB",
            "email": "siren.b@mailinator.com",
            "businessId": 8008,
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "BBB",
            "group": "sme"
          },
          "resultCode": 1
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "87",
            "realmId": "123146320035089",
            "chooseBusiness": true,
            "organization": "MULTI_BUSINESS",
            "email": "siren.c@mailinator.com",
            "firstName": "SirenCCC",
            "lastName": "ChenCCC",
            "owner": 8006,
            "type": "QuickbooksContact",
            "businessName": "MULTI_BUSINESS",
            "group": "sme"
          },
          "resultCode": 2
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.contacts.Contact",
            "organization": "DDD",
            "email": "siren.d@mailinator.com",
            "firstName": "SirenDDD",
            "lastName": "ChenDDD",
            "businessAddress": {
              "class": "foam.nanos.auth.Address"
            },
            "owner": 8006,
            "id": 8010,
            "phone": {
              "class": "foam.nanos.auth.Phone"
            },
            "mobile": {
              "class": "foam.nanos.auth.Phone"
            },
            "address": {
              "class": "foam.nanos.auth.Address"
            },
            "businessName": "DDD",
            "nextLoginAttemptAllowedAt": "2019-03-26T19:42:43.308Z",
            "businessPhone": {
              "class": "foam.nanos.auth.Phone"
            },
            "group": "sme"
          },
          "newContact": {
            "class": "net.nanopay.accounting.quickbooks.model.QuickbooksContact",
            "quickId": "88",
            "realmId": "123146320035089",
            "organization": "DDD",
            "email": "siren.d@mailinator.com",
            "firstName": "SirenDDD",
            "lastName": "ChenDDD",
            "owner": 8006,
            "mobile": {
              "class": "foam.nanos.auth.Phone",
              "verified": false,
              "number": ""
            },
            "type": "QuickbooksContact",
            "businessPhone": {
              "class": "foam.nanos.auth.Phone",
              "verified": false,
              "number": ""
            },
            "group": "sme"
          },
          "resultCode": 0
        },
        {
          "class": "net.nanopay.accounting.ContactMismatchPair",
          "existContact": {
            "class": "net.nanopay.contacts.Contact",
            "organization": "EEE",
            "email": "siren.e@mailinator.com",
            "signUpStatus": 2,
            "businessId": 8012,
            "businessAddress": {
              "class": "foam.nanos.auth.Address"
            },
            "businessStatus": 2,
            "owner": 8006,
            "id": 8013,
            "phone": {
              "class": "foam.nanos.auth.Phone"
            },
            "mobile": {
              "class": "foam.nanos.auth.Phone"
            },
            "address": {
              "class": "foam.nanos.auth.Address"
            },
            "businessName": "EEE",
            "nextLoginAttemptAllowedAt": "2019-03-26T19:48:18.577Z",
            "businessPhone": {
              "class": "foam.nanos.auth.Phone"
            },
            "group": "sme"
          },
          "resultCode": 3
        }
      ]
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Next',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage2',
          doSync: true,
          reportResult: this.reportResult
        });
      }
    }
  ]
});
