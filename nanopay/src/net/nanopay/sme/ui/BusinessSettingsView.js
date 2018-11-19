foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessSettingsView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.UnstyledTabs',
    'foam.u2.Tab',
    'net.nanopay.sme.ui.IntegrationsView'
  ],

  css: `
    ^ {
      margin-left: 50px;
    }
    ^ .foam-u2-UnstyledTabs-tab {
      width: 109px;
      height: 19px;
      font-size: 14px;
      opacity: 0.3;
      font-family: Avenir;
      color: #000000;
      margin-right: 20px;
      cursor: pointer;
    }
    ^ .selected {
      font-weight: 900;
      color: black;
      opacity: 1;
      border-bottom: 2px solid black;
    }
    ^ .foam-u2-UnstyledTabs-tabRow {
      margin-bottom: 25px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Business Settings' },
    { name: 'COMPANY_TAB', message: 'Company profile' },
    { name: 'USER_MANAGEMENT_TAB', message: 'User Management' },
    { name: 'INTEGRATION_TAB', message: 'Integrations' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var tabs = this.UnstyledTabs.create()
        .start(this.Tab, { label: this.COMPANY_TAB }).add('Add company profile here').end()
        .start(this.Tab, { label: this.USER_MANAGEMENT_TAB }).add('Add user management here').end()
        .start(this.Tab, { label: this.INTEGRATION_TAB }).add(this.IntegrationsView.create({}, this)).end()

      this.addClass(this.myClass())
      .start('h1').add(this.TITLE).end()
      .start(tabs).end();
    }
  ]

});
