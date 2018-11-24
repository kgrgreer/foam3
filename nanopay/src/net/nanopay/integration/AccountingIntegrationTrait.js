foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'AccountingIntegrationTrait',

  documentation: 'Manages the buttons for Accounting Integrations',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'ctrl',
    'xeroSignIn',
    'quickSignIn'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn',
      documentation: 'True if signed in to Accounting.'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.user.integrationCode == 1 ) {
        this.xeroSignIn.isSignedIn(null, this.user).then((result) => {
          this.isSignedIn = ! ! result.result;
        })
        .catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message,
            type: 'error'
          }));
        });
      } else if ( this.user.integrationCode == 2 ) {
        this.quickSignIn.isSignedIn(null, this.user).then((result) => {
          this.isSignedIn = ! ! result.result;
        })
        .catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message,
            type: 'error'
          }));
        });
      }
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
    {
      name: 'syncBtn',
      label: 'Sync with Accounting',
      isAvailable: function(isSignedIn) {
        return isSignedIn;
      },
      code: function(X) {
        if ( this.user.integrationCode == 1 ) {
          this.xeroSignIn.syncSys(null, X.user).then((result) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: result.reason,
              type: ( ! result.result ) ? 'error' : ''
            }));
            this.isSignedIn = result.result;
          })
          .catch((err) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: err.message,
              type: 'error'
            }));
          });
        } else if ( this.user.integrationCode == 2 ) {
          this.quickSignIn.syncSys(null, X.user).then((result) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: result.reason,
              type: ( ! result.result ) ? 'error' : ''
            }));
            this.isSignedIn = result.result;
          })
          .catch((err) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: err.message,
              type: 'error'
            }));
          });
        }
      }
    },
  ]
});
