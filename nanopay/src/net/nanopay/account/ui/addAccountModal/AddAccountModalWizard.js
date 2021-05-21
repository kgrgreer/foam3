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
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AddAccountModalWizard',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Modal Wizard for adding an account',

  css: `
    ^ {
      background: white;
    }
  `,

  methods: [
    function init() {
      this.views = {
        'typeSelection' : { view: { class: 'net.nanopay.account.ui.addAccountModal.accountType.AccountTypeModal' }, startPoint: true },
        'details': { view: { class: 'net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsModal' } },
        'limits': { view: { class: 'net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimitModal' } },
        'liquidity': { view: { class: 'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleModal' } },
        'submit': { view: { class: 'net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal' } }
      };
    },

    function initE() {
      this.addClass(this.myClass());
      this.SUPER();
    }
  ]
});
