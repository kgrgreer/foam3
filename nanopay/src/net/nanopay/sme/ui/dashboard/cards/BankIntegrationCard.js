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
      name: 'SUBTITLE_ERROR',
      message: 'Could not load account'
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
      class: 'Boolean',
      name: 'isErrored',
      value: true
    },
    {
      class: 'String',
      name: 'subtitleToUse',
      expression: function(account, isLoading, isErrored) {
        if ( isLoading )  return this.SUBTITLE_LOADING;
        if ( isErrored )  return this.SUBTITLE_ERROR;
        if ( account )    return this.SUBTITLE_LINKED + ' ' + account.name;

        return this.SUBTITLE_EMPTY;
      }
    }
  ],

  methods: [
    function initE() {
      this.add(this.slot((account, subtitleToUse) => {
        return this.E()
          .start(this.IntegrationCard, {
            iconPath: this.iconPath,
            title: this.TITLE,
            subtitle: subtitleToUse,
            action: account ? this.VIEW_ACCOUNT : this.ADD_BANK
          }).end();
      }));
    }
  ],

  actions: [
    {
      name: 'viewAccount',
      label: 'View',
      isEnabled: function(isLoading, isErrored) {
        if ( isLoading ) {
          return false;
        }

        if ( isErrored ) {
          return false;
        }

        return true;
      },
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    },
    {
      name: 'addBank',
      label: 'Add',
      isEnabled: function(isLoading, isErrored) {
        if ( isLoading ) {
          return false;
        }

        if ( isErrored ) {
          return false;
        }

        return true;
      },
      code: function() {
        this.stack.push({
          class: 'net.nanopay.bank.ui.BankPickCurrencyView',
          cadAvailable: true
        });
      }
    }
  ]
});
