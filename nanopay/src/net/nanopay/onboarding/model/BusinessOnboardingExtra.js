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
  package: 'net.nanopay.onboarding.model',
  name: 'BusinessOnboardingExtra',

  documentation: `Extra information that will automatic saved to ucjDAO when unlock Domestic Payments and Invoicing status change to pending`,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'submitBy'
    }
  ],
});
  