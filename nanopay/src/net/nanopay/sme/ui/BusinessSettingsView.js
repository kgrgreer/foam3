foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessSettingsView',
  extends: 'foam.u2.View',

  documentation: `Setting view displaying business information, user management and integration view`,

  imports: [
    'user'
  ],

  requires: [
    'foam.u2.Tab',
    'foam.u2.UnstyledTabs',
    'net.nanopay.settings.business.UserManagementView',
    'net.nanopay.sme.ui.CompanyInformationView',
    'net.nanopay.sme.ui.IntegrationSettingsView'
  ],

  css: `
    ^ {
      margin: 50px;
    }
    ^ .foam-u2-UnstyledTabs-tab {
      width: 109px;
      height: 19px;
      font-size: 16px;
      font-family: Avenir;
      color: #8e9090;
      margin-right: 20px;
      cursor: pointer;
    }
    ^ .selected {
      opacity: 1;
      border-bottom: 2px solid #604aff;
      padding-bottom: 8px;
      color: #604aff;
      z-index: 1;
    }
    ^ .foam-u2-UnstyledTabs-tabRow {
      margin-bottom: 35px;
    }
    ^ .section-line {
      width: 100%;
      height: 2px;
      position: relative;
      top: 32px;
      background: #e2e2e3;
      z-index: -1;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Business Settings' },
    { name: 'COMPANY_TAB', message: 'Company profile' },
    { name: 'USER_MANAGEMENT_TAB', message: 'User Management' },
    { name: 'INTEGRATION_TAB', message: 'Integrations' }
  ],

  properties: [
    'preSelectedTab'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var tabs = this.UnstyledTabs.create()
        .start(this.Tab, { label: this.COMPANY_TAB, selected: this.preSelectedTab && this.preSelectedTab === 'COMPANY_TAB' }).add(
          this.CompanyInformationView.create({}, this)
        ).end();
      if ( this.user.group.includes('admin') ) {
        tabs.start(this.Tab, { label: this.USER_MANAGEMENT_TAB, selected: this.preSelectedTab && this.preSelectedTab === 'USER_MANAGEMENT_TAB' }).add(
          this.UserManagementView.create({}, this)
        ).end();
      }
      tabs.start(this.Tab, { label: this.INTEGRATION_TAB, selected: this.preSelectedTab && this.preSelectedTab === 'INTEGRATION_TAB' }).add(
          this.IntegrationSettingsView.create({}, this)
          ).end();

      this.addClass(this.myClass())
      .start('h1').add(this.TITLE).end()
      .start().addClass('section-line').end()
      .start(tabs).end();
    }
  ]

});
