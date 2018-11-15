foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'IntegrationView',
  extends: 'foam.u2.View',

  documentation: 'Accounting Integration Management',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'stack',
    'xeroService',
    'xeroSignIn',
    'quickSignIn',
    'quickService'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^{
      width: 1280px;
      margin: auto;
    }
    ^ .Container {
      width: 992px;
      min-height: 80px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
      margin-left: 160px;
      margin-top: 50px;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: 'Roboto';
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
      margin: 0;
    }
    ^ .close-BTN {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-family: 2px;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
      cursor: pointer;
      display: inline-block;
      margin: 0;
      float: right;
    }
    ^ .labelContent {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      min-height: 15px;
    }
    ^ .integrationImgDiv{
      width: 223px;
      height: 120px;
      border: solid 1px #dce0e7;
      display: inline-block;
      margin: 25px 20px 30px 0px;
      position: relative;
      box-sizing: border-box;
    }
    ^ .integrationImg{
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
    }
    ^ .last-integrationImgDiv{
      margin-right: 0;
    }

    ^ .centerDiv{
      margin: auto;
      text-align: center;
    }
    ^ .intergration-Input{
      width: 225px;
      height: 30px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      display: inline-block;
      margin-right: 20px;
    }
    ^ .submit-BTN{
      width: 110px;
      height: 30px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      box-sizing: border-box;
      font-size: 14px;
      line-height: 2.14;
      letter-spacing: 0.2px;
      text-align: center;
      color: #59a5d5;
      display: inline-block;
      cursor: pointer;
    }
    ^ .submit-BTN:hover{
      background-color: #59a5d5;
      color: white;
    }
    ^ .inputLine{
      margin-top: 20px;
    }
  `,
  messages: [
    { name: 'noBank', message: `No bank accounts found` },
    { name: 'noSign', message: `Not signed in` },
    { name: 'bank', message: `Bank accounts found` }
  ],

  methods: [
   function initE() {
     this.SUPER();
     this
      .addClass(this.myClass())
      .start('div').addClass('Container')
        .start('div')
          .start().addClass('labelContent').add('Connect to your accounting software and make your payment process seamlessly.').end()
          .start().addClass('integrationImgDiv')
            .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/xero.png' }).addClass('integrationImg')
            .attrs({
                srcset: 'images/setting/integration/xero@2x.png 2x, images/setting/integration/xero@3x.png 3x'
                })
                .on('click', this.signXero)
            .end()
          .end()
          .start().addClass('integrationImgDiv')
            .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/xero.png' }).addClass('integrationImg')
            .attrs({
                srcset: 'images/setting/integration/xero@2x.png 2x, images/setting/integration/xero@3x.png 3x'
                })
                .on('click', this.syncXero)
            .end()
          .end()
          .start().addClass('integrationImgDiv')
            .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/qb.png' }).addClass('integrationImg')
            .attrs({
                srcset: 'images/setting/integration/qb@2x.png 2x, images/setting/integration/qb@3x.png 3x'
                })
                .on('click', this.signQuick)
            .end()
          .end()
          .start().addClass('integrationImgDiv').addClass('last-integrationImgDiv')
          .start({ class: 'foam.u2.tag.Image', data: 'images/setting/integration/intacct.png' }).addClass('integrationImg')
            .attrs({
                srcset: 'images/setting/integration/intacct@2x.png 2x, images/setting/integration/intacct@3x.png 3x'
                })
            .end()
        .end()
        .start(this.CHECK_SIGNIN).end()
        .start(this.FULL_SYNC).end()
        .start(this.CONTACT_SYNC).end()
        .start(this.INVOICE_SYNC).end()
        .start(this.LIST_SYNC).end()
        .start().addClass('labelContent').addClass('centerDiv').add('Can’t find your software? Tell us about it.').end()
        .start().addClass('centerDiv').addClass('inputLine')
          .start('input').addClass('intergration-Input').end()
          .start().add('submit').addClass('submit-BTN').end()
        .end()
      .end();
    }
  ],
  actions: [
    {
      name: 'checkSignin',
      code: function(X) {
        var self = this;
        this.quickSignIn.isSignedIn(null, X.user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'fullSync',
      code: function(X) {
        var self = this;
        this.quickSignIn.syncSys(null, X.user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'contactSync',
      code: function(X) {
        var self = this;
        this.quickSignIn.contactSync(null, X.user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'invoiceSync',
      code: function(X) {
        var self = this;
        this.quickSignIn.invoiceSync(null, X.user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'listSync',
      code: function(X) {
        var self = this;
        this.quickSignIn.pullBanks(null, X.user).then(function(result) {
          debugger;
          if ( result == [] ) {
            self.add(self.NotificationMessage.create({ message: self.noBank, type: 'error' }));
          } else if ( result === undefined ) {
            self.add(self.NotificationMessage.create({ message: self.noSign, type: 'error' }));
          } else {
            self.add(self.NotificationMessage.create({ message: self.bank, type: '' }));
          }
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'signOut',
      code: function(X) {
        var self = this;
        this.quickSignIn.removeToken(null, X.user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
  ],
  listeners: [

    function signXero() {
      var url = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
      window.location = url;
    },
    function syncXero() {
      var url = window.location.origin + '/service/xeroComplete?portRedirect=' + window.location.hash.slice(1);
      window.location = url;
    },
    function signQuick() {
      var url = window.location.origin + '/service/quick?portRedirect=' + window.location.hash.slice(1);
      window.location = url;
    },
  ]
});
