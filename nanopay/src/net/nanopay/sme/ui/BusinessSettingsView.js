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
    'foam.u2.dialog.Popup',
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
    { name: 'INTEGRATION_TAB', message: 'Integrations' },
    { name: 'GENERIC_ERROR', message: 'There was an unexpected error.' }
  ],

  properties: [
    'preSelectedTab',
    'hasPermission'
  ],

  methods: [
    async function initE() {
      this.SUPER();
      var showIntegrationTab = await this.accountingIntegrationUtil.getPermission();
      this.auth
        .check(null, 'menu.read.sme.userManagement')
        .then((hasPermission) => {
          var tabs = this.UnstyledTabs.create()
            .start(this.Tab, {
              label: this.COMPANY_TAB,
              selected: this.preSelectedTab && this.preSelectedTab === 'COMPANY_TAB'
            })
              .add(this.CompanyInformationView.create({}, this))
            .end();

          if ( hasPermission ) {
            tabs.start(this.Tab, { label: this.USER_MANAGEMENT_TAB, selected: this.preSelectedTab && this.preSelectedTab === 'USER_MANAGEMENT_TAB' }).add(
              this.UserManagementView.create({}, this)
            ).end();
          }

          if ( showIntegrationTab[0] ) {
            tabs.start(this.Tab, {
              label: this.INTEGRATION_TAB,
              selected: this.preSelectedTab && this.preSelectedTab === 'INTEGRATION_TAB'
            })
              .add(this.IntegrationSettingsView.create({}, this))
            .end();
          }
          this.addClass(this.myClass())
            .startContext({ data: this })
              .tag(this.CREATE_BUSINESS)
            .endContext()
            .start('h1').add(this.TITLE).end()
            .start().addClass('section-line').end()
            .tag(tabs);
        })
        .catch((err) => {
          console.error(err);
          this.notify(err.message || this.GENERIC_ERROR, 'error');
        });
    }
  ],
  actions: [
    {
      name: 'createBusiness',
      code: function(X) {
        this.add(this.Popup.create(null, X).tag({
          class: 'net.nanopay.sme.ui.CreateBusinessModal',
        }));
      }
    }
  ]

});
