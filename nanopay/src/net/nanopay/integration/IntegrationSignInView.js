foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'IntegrationSignInView',
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
    'user'
  ],

  exports: [
    'as data'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn'
    }
  ],

  css: `
    ^ .div {
      width: 100px;
      margin: auto;
    }
    ^ .syncBtn{
      background-color: rgba(164, 179, 184, 0.1);
    box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    cursor: pointer;
      cursor: pointer;
    }
    ^ .signInBtn{
      background-color: rgba(164, 179, 184, 0.1);
    box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    cursor: pointer;
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

  methods: [
   function init() {
    this.SUPER();
    self = this;
    this.xeroSignIn.isSignedIn(null, this.__subContext__.user).then(function(result) {
      if ( ! result.result ) {
        self.add(self.NotificationMessage.create({ message: result.reason, type: 'error' }));
        self.isSignedIn = false;
      } else {
        self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
        self.isSignedIn = true;
      }
    })
    .catch(function(err) {
      self.add(this.NotificationMessage.create({ message: err.message, type: 'error' }));
    });
   },
   function initE() {
    this.SUPER();
    console.log(this.isSignedIn);
    this
     .addClass(this.myClass())
     .start(this.SYNC_BTN).show(this.isSignedIn$).addClass('syncBtn').end()
     .start(this.SIGN_IN_BTN).hide(this.isSignedIn$).addClass('signInBtn').end()
    }
  ],
  actions: [
    {
      name: 'SignInBtn',
      label: 'Sync with Xero',
      code: function(X) {
      var host = ('localhost'===(window.location.hostname) || '127.0.0.1'===(window.location.hostname))
          ? window.location.hostname + ':'+window.location.port
          : window.location.hostname;
      path = window.location.protocol + '//' + host + '/';
      window.location = path +'service/xero?portRedirect='+ window.location.hash.slice(1);
      }
    },
    {
      name: 'checkSignIn',
      label: 'Check SignIn with Xero',
      code: function(X) {
        var self = this;
        this.xeroSignIn.isSignedIn(null, X.user).then(function(result) {
          if ( ! result.result ) {
            self.add(self.NotificationMessage.create({ message: result.reason, type: 'error' }));
            self.isSignedIn = false;
          } else {
            self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
            self.isSignedIn = true;
          }
          console.log(self.isSignedIn);
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'SyncBtn',
      label: 'Sync with Xero',
      code: function(X) {
        var self = this;
        this.xeroSignIn.syncSys(null, X.user).then(function(result) {
          if ( ! result.result ) {
            self.add(self.NotificationMessage.create({ message: result.reason, type: 'error' }));
          } else {
            self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
          }
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
        this.xeroSignIn.contactSync(null, X.user).then(function(result) {
          if ( ! result.result ) {
            self.add(self.NotificationMessage.create({ message: result.reason, type: 'error' }));
          } else {
            self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
          }
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
        this.xeroSignIn.invoiceSync(null, X.user).then(function(result) {
          if ( ! result.result ) {
            self.add(self.NotificationMessage.create({ message: result.reason, type: 'error' }));
          } else {
            self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
          }
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
  ],
  listeners: [

    function signXero() {
      var host = ('localhost'===(window.location.hostname) || '127.0.0.1'===(window.location.hostname))
          ? window.location.hostname + ':'+window.location.port
          : window.location.hostname;
      path = window.location.protocol + '//' + host + '/';
      window.location = path +'service/xero?portRedirect='+ window.location.hash;
    },
    function syncXero() {
      var host = ('localhost'===(window.location.hostname) || '127.0.0.1'===(window.location.hostname))
          ? window.location.hostname + ':'+window.location.port
          : window.location.hostname;
      path = window.location.protocol + '//' + host + '/';
      window.location = path + 'service/xeroComplete?portRedirect='+ window.location.hash;
    },
  ]
});
