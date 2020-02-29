foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'QBIntegrationCard',
  extends: 'foam.u2.Controller',

  documentation: `
    This card is specific to check if the user has a quickbooks integration
    enabled and provides actions for both enabled and disabled.
  `,

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.sme.ui.dashboard.cards.IntegrationCard',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'userDAO',
    'pushMenu'
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Accounting software'
    },
    {
      name: 'SUBTITLE_EMPTY',
      message: 'Not connected'
    },
    {
      name: 'SUBTITLE_LINKED',
      message: 'Connected to QBO'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'iconPath',
      value: 'images/ablii/QBO@2x.png'
    },
    {
      class: 'Boolean',
      name: 'hasPermission'
    },
    {
      class: 'Boolean',
      name: 'hasIntegration'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'updatedUser'
    }
  ],

  methods: [
    async function init() {
      this.updatedUser = await this.userDAO.find(this.user.id);
      var self = this;
      this.add(this.slot(function(updatedUser) {
        return this.E()
          .start(self.IntegrationCard, {
            iconPath: self.iconPath,
            title: self.TITLE + ' (BETA)',
            subtitle: updatedUser.integrationCode === this.IntegrationCode.QUICKBOOKS ? self.SUBTITLE_LINKED: self.SUBTITLE_EMPTY,
            action: updatedUser.integrationCode === self.IntegrationCode.QUICKBOOKS && self.hasIntegration ? self.SYNC : self.CONNECT
          }).end();
      }));
    }
  ],

  actions: [
    {
      name: 'sync',
      label: 'Sync',
      isAvailable: function(hasPermission) {
        return hasPermission;
      },
      code: function() {
        this.pushMenu('sme.bank.matching');
      }
    },
    {
      name: 'connect',
      label: 'Connect',
      isAvailable: function(hasPermission) {
        return hasPermission;
      },
      code: function() {
        // var url = window.location.origin + '/service/quickbooksWebAgent?portRedirect=' + window.location.hash.slice(1);
        this.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    }
  ]
});
