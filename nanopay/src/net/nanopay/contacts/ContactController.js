foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup'
  ],

  implements: [
    'net.nanopay.integration.AccountingIntegrationTrait'
  ],

  imports: [
    'user'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.contacts;
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        return this.Action.create({
          name: 'addContact',
          label: 'Add a Contact',
          code: function(X) {
            this.add(this.Popup.create().tag({
              class: 'net.nanopay.contacts.ui.modal.ContactModal'
            }));
          }
        });
      }
    },
    {
      name: 'contextMenuActions',
      factory: function() {
        var self = this;
        return [
          this.Action.create({
            name: 'edit',
            code: function(X) {
              X.controllerView.add(self.Popup.create(null, X).tag({
                class: 'net.nanopay.contacts.ui.modal.ContactModal',
                data: this,
                isEdit: true
              }));
            }
          }),
          this.Action.create({
            name: 'requestMoney',
            code: function(X) {
              alert('Not implemented yet!');
              // TODO: Fill this in when we have the request money screens.
            }
          }),
          this.Action.create({
            name: 'sendMoney',
            code: function(X) {
              alert('Not implemented yet!');
              // TODO: Fill this in when we have the send money screens.
            }
          }),
          this.Action.create({
            name: 'delete',
            code: function(X) {
              X.controllerView.add(self.Popup.create(null, X).tag({
                class: 'net.nanopay.contacts.ui.modal.ContactModal',
                data: this,
                isDelete: true
              }));
            }
          })
        ];
      }
    },
    {
      class: 'Boolean',
      name: 'isSignedIn',
      documentation: 'True if signed in to Xero.'
    }
  ],

  /*
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
  */
});
