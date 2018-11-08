foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'AccountingIntegrationTrait',

  documentation: '', // TODO

  imports: [
    'ctrl',
    'xeroService',
    'xeroSignIn'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn',
      documentation: 'True if signed in to Xero.'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.xeroSignIn
        .isSignedIn(null, this.user)
        .then((result) => {
          this.isSignedIn = ! ! result.result;
        })
        .catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message,
            type: 'error'
          }));
        });
    }
  ],

  actions: [
    {
      name: 'sync',
      label: 'Sync',
      isAvailable: function(isSignedIn) {
        return ! isSignedIn;
      },
      code: function(X) {
        X.controllerView.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    },
    // NOTE: Replaced by the modal I think.
    //
    // {
    //   name: 'signInBtn',
    //   label: 'Sync with Xero',
    //   code: function(X) {
    //     var url = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
    //     window.location = url;
    //     }
    // },
    {
      name: 'syncBtn',
      label: 'Sync with Xero',
      isAvailable: function(isSignedIn) {
        return isSignedIn;
      },
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
      isAvailable: function(isSignedIn) {
        return isSignedIn;
      },
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
    }
  ]
});
