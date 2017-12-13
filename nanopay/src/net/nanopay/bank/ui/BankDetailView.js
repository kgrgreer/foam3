foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankDetailView',
  extends: 'foam.u2.View',

  documentation: 'View displaying selected bank.',

  requires: [
    'net.nanopay.ui.ExpandContainer',
    'net.nanopay.settings.business.BusinessSettingsCard'
  ],

  properties: [
    'data'
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ .net-nanopay-ui-ExpandContainer{
      margin-bottom: 20px;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      var businessProfile = this.ExpandContainer.create({ title: this.data.organization + ' Profile' });

      this
        .addClass(this.myClass())
        .start(businessProfile)
          .add(this.BusinessSettingsCard.create({ data: this.data}))
        .end()
        .tag({ class: 'net.nanopay.ui.BalanceView', data: this.account });
    }
  ]
});
