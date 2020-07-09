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
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationTrait',

  documentation: 'Manages the buttons for Accounting Integrations',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.AccountingErrorCodes'
  ],

  imports: [
    'contactDAO',
    'ctrl',
    'invoiceDAO',
    'notify',
    'quickbooksService',
    'userDAO',
    'xeroService'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isSignedIn',
      documentation: 'True if signed in to Accounting.'
    },
    {
      name: 'hasPermissions',
      factory: function() {
        return [false, false, false];
      }
    }
  ],

  css: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-359deg);
      }
    }

    .account-sync-loading-animation .foam-u2-ActionView-syncBtn > img {
      animation-name: spin;
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
  `,

  methods: [
    async function init() {
      this.SUPER();

      this.hasPermissions = await this.accountingIntegrationUtil.getPermission();
      /*
      Retrieves the updated user as session user is only image of user at login.
      Determines which integration is being used at the moment as both integrations can not be simultaneously used.
      */

      let service = null;
      let newUser = await this.userDAO.find(this.subject.user.id);

      if ( newUser.integrationCode == this.IntegrationCode.XERO ) {
        service = this.xeroService;
      }
      
      if ( newUser.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        service = this.quickbooksService;
      }

      if ( service !== null ) {
        try {
          let result = await service.isSignedIn(null, newUser);
          this.isSignedIn = result.result;
        } catch (error) {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        }
      } else {
        this.isSignedIn = false;
      }
    }
  ],

  actions: [
    {
      name: 'sync',
      label: 'Sync with Accounting',
      isAvailable: function(isSignedIn, hasPermissions) {
        return (! isSignedIn) && hasPermissions[0];
      },
      code: function(X) {
        X.controllerView.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    },
    {
      name: 'syncBtn',
      label: 'Sync',
      icon: 'images/ablii/sync-resting.svg',
      isAvailable: function(isSignedIn, hasPermissions) {
        return isSignedIn && hasPermissions[0];
      },
      code: async function(X) {
        X.controllerView.addClass('account-sync-loading-animation');
        let result = await this.accountingIntegrationUtil.doSync(X.controllerView);
        if ( result !== null ) {
          this.stack.push({
            class: 'net.nanopay.accounting.ui.AccountingReportPage1',
            reportResult: result
          });
        }
        X.controllerView.removeClass('account-sync-loading-animation');
      }
    },
  ]
});
