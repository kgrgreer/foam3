/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.auth',
  name: 'ServiceProviderRefinement',
  refines: 'foam.nanos.auth.ServiceProvider',

  messages: [
    { name: 'INVALID_ISSUER', message: 'Payment issuer tag cannot exceed 15 characters' }
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentIssuerTag',
      factory: function() {
        return this.id;
      },
      javaFactory: `
        return getId();
      `,
      validationPredicates: [
        {
          args: ['paymentIssuerTag'],
          predicateFactory: function(e) {
            return e.LTE(foam.mlang.StringLength.create({
              arg1: foam.nanos.auth.ServiceProvider.PAYMENT_ISSUER_TAG
            }), 15);
          },
          errorMessage: 'INVALID_ISSUER'
        }
      ],
    }
  ]
});
