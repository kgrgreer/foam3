foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'BankIntegrationCard',
  extends: 'foam.u2.Controller',

  documentation: `
    Card specific for checking if the user has a bank attached to their account.
    Actions are provided for both scenarios (attached or not).
  `,

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.sme.ui.dashboard.cards.IntegrationCard',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'stack',
    'user'
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Bank account'
    },
    {
      name: 'SUBTITLE_LOADING',
      message: 'Loading...'
    },
    {
      name: 'SUBTITLE_EMPTY',
      message: 'No account added yet'
    },
    {
      name: 'SUBTITLE_LINKED',
      message: 'Connected to'
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'account'
    },
    {
      class: 'String',
      name: 'iconPath',
      value: 'images/ablii/ic-dashboardBank.svg'
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    },
    {
      class: 'String',
      name: 'subtitleToUse',
      expression: function(account, isLoading) {
        if ( isLoading ) {
          return this.SUBTITLE_LOADING;
        }

        if ( account ) {
          return this.SUBTITLE_LINKED + ' ' + account.name;
        }

        return this.SUBTITLE_EMPTY;
      }
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.accountDAO.where(this.EQ(this.Account.OWNER, this.user.id)).limit(1).select().then(function(accounts) {
        if ( accounts.length > 0 ) {
          self.account = accounts[0];
        }
        self.isLoading = false;
      });
    },

    function initE() {
      var self = this;
      this.add(this.slot(function(account, subtitleToUse) {
        return this.E()
          .start(self.IntegrationCard, {
            iconPath: self.iconPath,
            title: self.TITLE,
            subtitle: subtitleToUse,
            action: account ? self.VIEW_ACCOUNT : self.ADD_BANK
          }).end();
      }));
    }
  ],

  actions: [
    {
      name: 'viewAccount',
      label: 'View',
      isEnabled: function(isLoading) {
        return isLoading ? false : true;
      },
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    },
    {
      name: 'addBank',
      label: 'Add',
      isEnabled: function(isLoading) {
        return isLoading ? false : true;
      },
      code: function() {
        this.stack.push({
          class: 'net.nanopay.bank.ui.BankPickCurrencyView',
          usdAvailable: true,
          cadAvailable: true
        });
      }
    }
  ]
});
