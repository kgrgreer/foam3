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
    ^ .syncBtn {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      cursor: pointer;
    }
    ^ .signInBtn {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      cursor: pointer;
    }
  `,

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.xeroSignIn.isSignedIn(null, this.user)
      .then(function(result) {
        if ( ! result.result ) {
          self.isSignedIn = false;
        } else {
          self.isSignedIn = true;
        }
      })
      .catch(function(err) {
        self.add(this.NotificationMessage.create({ message: err.message, type: 'error' }));
      });
    },
    function initE() {
      this.SUPER();
      this
      .addClass(this.myClass()).style({ 'display': 'contents' })
        .start(this.SYNC_BTN).show(this.isSignedIn$).addClass('syncBtn').end()
        .start(this.SIGN_IN_BTN).hide(this.isSignedIn$).addClass('signInBtn').end()
      .end();
    }
  ],
  actions: [
    {
      name: 'SignInBtn',
      label: 'Sync with Xero',
      code: function(X) {
        window.location = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
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
            self.isSignedIn = false;
          } else {
            self.add(self.NotificationMessage.create({ message: result.reason, type: '' }));
            self.isSignedIn = true;
          }
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
