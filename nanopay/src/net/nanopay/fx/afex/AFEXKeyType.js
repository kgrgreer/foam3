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

foam.ENUM({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXKeyType',

  documentation: 'AFEX key usage configuration.',

  values: [
    {
      name: 'ONBOARDING',
      documentation: 'Key used for onboarding.',
    },
    {
      name: 'PAYMENTS',
      documentation: `Key used for quote, trade and instant payment.`,
    },
    {
      name: 'AFEX_BUSINESS',
      documentation: 'AfexBusiness api key. used for afex beneficiary creation and payment scheduling',
    }
  ]
});
