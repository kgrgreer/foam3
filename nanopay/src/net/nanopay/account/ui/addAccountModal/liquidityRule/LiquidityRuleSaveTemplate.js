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
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule',
  name: 'LiquidityRuleSaveTemplate',

  documentation: `
    A view model for the saving a threshold rule as a template
  `,

  properties: [
    {
      class: 'String',
      name: 'thresholdRuleName',
      label: 'Threshold rule name',
      documentation: `
        The name for the threshold rule
      `,
      validateObj: function(thresholdRuleName) {
        if ( thresholdRuleName.length === 0 || ! thresholdRuleName.trim() ) {
          return 'Please name this threshold rule.';
        }
      }
    }
  ]
});
