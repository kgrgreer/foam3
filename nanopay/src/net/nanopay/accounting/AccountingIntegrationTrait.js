foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationTrait',

  documentation: 'Manages the buttons for Accounting Integrations',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.AccountingErrorCodes'
  ],

  imports: [
    'contactDAO',
    'ctrl',
    'invoiceDAO',
    'quickbooksService',
    'userDAO',
    'xeroService'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn',
      documentation: 'True if signed in to Accounting.'
    }
  ],

  css: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-359deg);
      }
    }

    .account-sync-loading-animation .net-nanopay-ui-ActionView-syncBtn > img {
      animation-name: spin;
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
  `,

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      /*
      Retrieves the updated user as session user is only image of user at login.
      Determines which integration is being used at the moment as both integrations can not be simultaneously used.
      */
      this.userDAO.find(this.user.id).then(function(nUser) {
        if ( nUser.integrationCode == self.IntegrationCode.XERO ) {
          self.xeroService.isSignedIn(null, nUser).then((result) => {
            self.isSignedIn = ! ! result.result;
          })
          .catch((err) => {
            self.ctrl.add(this.NotificationMessage.create({
              message: err.message,
              type: 'error'
            }));
          });
        } else if ( nUser.integrationCode == self.IntegrationCode.QUICKBOOKS ) {
          self.quickbooksService.isSignedIn(null, nUser).then((result) => {
            self.isSignedIn = ! ! result.result;
          })
          .catch((err) => {
            self.ctrl.add(this.NotificationMessage.create({
              message: err.message,
              type: 'error'
            }));
          });
        }
      });
    }
  ],

  actions: [
    {
      name: 'sync',
      label: 'Sync with Accounting',
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
      label: 'Sync',
      icon: 'images/ablii/sync-resting.svg',
      isAvailable: function(isSignedIn) {
        return isSignedIn;
      },
      code: async function(X) {
        let self = this;
        X.controllerView.addClass('account-sync-loading-animation');
        let service;

        if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
          service = this.xeroService;
        }
        if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
          service = this.quickbooksService;
        }


        let contactsResult = await service.contactSync(null);
        if ( contactsResult.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
          X.controllerView.add(self.Popup.create({ closeable: false }).tag({
            class: 'net.nanopay.accounting.AccountingTimeOutModal'
          }));
        }

        if ( contactsResult.result === false ) {
          this.ctrl.notify(contactsResult.reason, 'error');
        }

        // run through contact missmatch if any

        let invoicesResult = await service.invoiceSync(null);
        if ( invoicesResult.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
          X.controllerView.add(self.Popup.create({ closeable: false }).tag({
            class: 'net.nanopay.accounting.AccountingTimeOutModal'
          }));
        }

        if ( invoicesResult.result === false ) {
          this.ctrl.notify(contactsResult.reason, 'error');
        }

        X.controllerView.removeClass('account-sync-loading-animation');
        this.contactDAO.cmd(foam.dao.AbstractDAO.RESET_CMD);
        this.invoiceDAO.cmd(foam.dao.AbstractDAO.RESET_CMD);

        if ( invoicesResult.result === true && contactsResult.result === true) {
          this.ctrl.notify('All information has been synchronized', 'error');
          this.add(this.Popup.create().tag({
            class: 'net.nanopay.accounting.ui.AccountingReportModal',
            invoiceResult: invoiceResult,
            contactResult: contactResult
          }));
        }
      }
    },
  ]
});
