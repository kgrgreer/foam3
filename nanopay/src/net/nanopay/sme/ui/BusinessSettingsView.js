foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessSettingsView',
  extends: 'foam.u2.View',

  documentation: `Setting view displaying business information, user management and integration view`,

  imports: [
    'accountingIntegrationUtil',
    'auth',
    'notify'
  ],

  requires: [
    'foam.u2.Tab',
    'foam.u2.UnstyledTabs',
    'net.nanopay.settings.business.UserManagementView',
    'net.nanopay.sme.ui.CompanyInformationView',
    'net.nanopay.sme.ui.IntegrationSettingsView',
    'net.nanopay.sme.ui.PrivacyView'
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
    { name: 'COMPANY_TAB', message: 'Company Profile' },
    { name: 'USER_MANAGEMENT_TAB', message: 'User Management' },
    { name: 'INTEGRATION_TAB', message: 'Integrations' },
    { name: 'PRIVACY_TAB', message: 'Privacy'},
    { name: 'GENERIC_ERROR', message: 'There was an unexpected error.' }
  ],

  properties: [
    'preSelectedTab'
  ],

  methods: [
    async function initE() {
      this.SUPER();

      try {
        const hasUMPermission = await this.auth.check(null, 'menu.read.sme.userManagement');
        const hasIntegrationPermission = (await this.accountingIntegrationUtil.getPermission())[0];
        const hasPrivacyPermission = await this.auth.check(null, 'business.rw.ispublic');

        // display Company Profile tab
        const tabs = this.UnstyledTabs.create()
          .start(this.Tab, {
            label: this.COMPANY_TAB,
            selected: this.preSelectedTab && this.preSelectedTab === 'COMPANY_TAB'
          })
            .add(this.CompanyInformationView.create({}, this))
          .end();

        // display User Management tab if user has permission
        if ( hasUMPermission ) {
          tabs.start(this.Tab, {
            label: this.USER_MANAGEMENT_TAB,
            selected: this.preSelectedTab && this.preSelectedTab === 'USER_MANAGEMENT_TAB'
          })
            .add(this.UserManagementView.create({}, this))
          .end();
        }

        // display Integrations tab if user has permission
        if ( hasIntegrationPermission ) {
          tabs.start(this.Tab, {
            label: this.INTEGRATION_TAB,
            selected: this.preSelectedTab && this.preSelectedTab === 'INTEGRATION_TAB'
          })
            .add(this.IntegrationSettingsView.create({}, this))
          .end();
        }

        // display Privacy tab if user has permission
        if ( hasPrivacyPermission ) {
          tabs.start(this.Tab, {
            label: this.PRIVACY_TAB,
            selected: this.preSelectedTab && this.preSelectedTab === 'PRIVACY_TAB'
          })
            .add(this.PrivacyView.create({}, this))
          .end();
        }

        this.addClass(this.myClass())
          .start('h1').add(this.TITLE).end()
          .start().addClass('section-line').end()
          .tag(tabs);
      } catch (err) {
        console.error(err);
        this.notify(err.message || this.GENERIC_ERROR, 'error');
      }
    }
  ]
});
