/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessSettingsView',
  extends: 'foam.u2.View',

  documentation: `Setting view displaying business information, user management and integration view`,

  imports: [
    'accountingIntegrationUtil',
    'auth',
    'ctrl'
  ],

  requires: [
    'foam.log.LogLevel',
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
    { name: 'TITLE', message: 'Business settings' },
    { name: 'COMPANY_TAB', message: 'Profile' },
    { name: 'USER_MANAGEMENT_TAB', message: 'User management' },
    { name: 'INTEGRATION_TAB', message: 'Integrations' },
    { name: 'PRIVACY_TAB', message: 'Privacy'},
    { name: 'GENERIC_ERROR', message: 'There was an unexpected error' }
  ],

  properties: [
    'preSelectedTab'
  ],

  methods: [
    async function initE() {
      this.SUPER();

      try {
        const [hasUMPermission, [hasIntegrationPermission], hasPrivacyPermission, hasPaymentcodePermission, hasTxnLimitPermission] = 
          await Promise.all([
            this.auth.check(null, 'businesssetting.read.userManagement'),
            this.accountingIntegrationUtil.getPermission(),
            this.auth.check(null, 'businesssetting.read.businessvisibility'),
            this.auth.check(null, 'businesssetting.read.paymentcode'),
            this.auth.check(null, 'businesssetting.read.transactionlimit')
          ]);

        // display Company Profile tab
        const tabs = this.UnstyledTabs.create()
          .start(this.Tab, {
            label: this.COMPANY_TAB,
            selected: this.preSelectedTab && this.preSelectedTab === 'COMPANY_TAB'
          })
            .add(this.CompanyInformationView.create({ 
              paymentCodePermission: hasPaymentcodePermission, 
              txnLimitPermission: hasTxnLimitPermission 
            }, this))
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
        this.ctrl.notify(err.message || this.GENERIC_ERROR, '', this.LogLevel.ERROR, true);
      }
    }
  ]
});
