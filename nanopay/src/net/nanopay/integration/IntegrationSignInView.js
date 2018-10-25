foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'IntegrationSignInView',
  extends: 'foam.u2.Controller',

  documentation: 'Accounting Integration Management',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'ctrl',
    'stack',
    'user',
    'xeroService',
    'xeroSignIn'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn'
    }
  ],

  css: `
    ^{
      display: contents;
    }
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
    ^ .signOutBtn {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-left: 2%;
      cursor: pointer;
    }
  `,

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.xeroSignIn.isSignedIn(null, this.user)
      .then(function(result) {
        self.isSignedIn = ( ! result.result ) ? false : true;
      })
      .catch(function(err) {
        ctrl.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
      });
    },
    function initE() {
      this.SUPER();
      this
      .addClass(this.myClass())
        .start(this.SYNC_BTN).show(this.isSignedIn$).addClass('syncBtn').end()
        .start(this.REMOVE_TOKEN).show(this.isSignedIn$).addClass('signOutBtn').end()
        .start(this.SIGN_IN_BTN).hide(this.isSignedIn$).addClass('signInBtn').end()
      .end();
    }
  ],
  actions: [
    {
      name: 'signInBtn',
      label: 'Sync with Xero',
      code: function(X) {
        var sessionId = localStorage['defaultSession'];
        var url = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
        window.location = ( sessionId ) ? url + '&sessionId=' + sessionId : url;
        }
    },
    {
      name: 'syncBtn',
      label: 'Sync with Xero',
      code: function(X) {
        var self = this;
        this.xeroSignIn.syncSys(null, X.user).then(function(result) {
          ctrl.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
          self.isSignedIn = result.result;
        })
        .catch(function(err) {
          ctrl.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
    {
      name: 'removeToken',
      label: 'Log out',
      code: function(X) {
        var self = this;
        this.xeroSignIn.removeToken(null, X.user).then(function(result) {
          ctrl.add(self.NotificationMessage.create({ message: result.reason, type: ( ! result.result ) ? 'error' :'' }));
          self.isSignedIn = ! result.result;
        })
        .catch(function(err) {
          ctrl.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    },
  ]
});
