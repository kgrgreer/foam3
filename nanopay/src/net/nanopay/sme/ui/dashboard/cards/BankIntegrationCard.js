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
      class: 'String',
      name: 'subtitleToUse',
      expression: function(isAccountThere) {
        if ( isAccountThere ) return this.SUBTITLE_LINKED + ' ' + this.account.name;

        return this.SUBTITLE_EMPTY;
      }
    },
    {
      class: 'Boolean',
      name: 'isAccountThere',
      expression: function(account) {
        return account != undefined && account.id != 0;
      }
    }
  ],

  methods: [
    function initE() {
      this.add(this.slot((subtitleToUse, isAccountThere) => {
        return this.E()
          .start(this.IntegrationCard, {
            iconPath: this.iconPath,
            title: this.TITLE,
            subtitle: subtitleToUse,
            action: isAccountThere ? this.VIEW_ACCOUNT : this.ADD_BANK
          }).end();
      }));
    }
  ],

  actions: [
    {
      name: 'viewAccount',
      label: 'View',
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    },
    {
      name: 'addBank',
      label: 'Add',
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    }
  ]
});
