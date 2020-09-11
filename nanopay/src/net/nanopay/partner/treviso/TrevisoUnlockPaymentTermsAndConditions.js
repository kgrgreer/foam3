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
  package: 'net.nanopay.partner.treviso',
  name: 'TrevisoUnlockPaymentTermsAndConditions',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  imports: [
    'appConfig'
  ],

  messages: [
    { name: 'ACKNOWLEDGE_BRAZIL_TC', message: 'Must acknowledge the Terms and Conditions.' }
  ],

  properties: [
    {
      name: 'title',
      value: `Unlock payment Terms and Conditions`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'link',
      value: '/service/file/9ff66c65-09be-f263-2389-d46ba1b30eb1'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.partner.treviso
              .TrevisoUnlockPaymentTermsAndConditions.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_BRAZIL_TC'
        }
      ]
    }
  ]
});
