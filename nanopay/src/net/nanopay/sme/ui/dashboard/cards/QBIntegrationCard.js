foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'QBIntegrationCard',
  extends: 'foam.u2.Controller',

  requires: [
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.sme.ui.dashboard.cards.IntegrationCard',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountingIntegrationUtil',
    'user',
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
      class: 'String',
      name: 'subtitleToUse',
      expression: function(user$integrationCode) {
        if ( user$integrationCode === this.IntegrationCode.QUICKBOOKS ) {
          return this.SUBTITLE_LINKED;
        }

        return this.SUBTITLE_EMPTY;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.user.integrationCode = self.IntegrationCode.QUICKBOOKS;
      this.add(this.slot(function(subtitleToUse) {
        return this.E()
          .start(self.IntegrationCard, {
            iconPath: self.iconPath,
            title: self.TITLE,
            subtitle: subtitleToUse,
            action: self.user.integrationCode === self.IntegrationCode.QUICKBOOKS ? self.SYNC : self.CONNECT
          }).end();
      }));
    },

    function attachSessionId(url) {
      // attach session id if available
      var sessionId = localStorage['defaultSession'];
      if ( sessionId ) {
        url += '&sessionId=' + sessionId;
      }
      return url;
    }
  ],

  actions: [
    {
      name: 'sync',
      label: 'Sync',
      code: function() {
        this.pushMenu('sme.bank.matching');
      }
    },
    {
      name: 'connect',
      label: 'Connect',
      code: function() {
        var url = window.location.origin + '/service/quickbooksWebAgent?portRedirect=' + window.location.hash.slice(1);
        window.location = this.attachSessionId(url);
      }
    }
  ]
});
