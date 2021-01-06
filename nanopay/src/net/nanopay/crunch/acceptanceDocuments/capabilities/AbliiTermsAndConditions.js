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
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AbliiTermsAndConditions',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  imports: [
    'appConfig'
  ],

  messages: [
    { name: 'ACKNOWLEDGE_ABLII_TC', message: 'Must acknowledge the Terms and Conditions' }
  ],

  properties: [
    {
      name: 'title',
      value: `Ablii's Terms and Conditions`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'fileId',
      factory: function() {
        return  'eb21ba1e-7bfc-ba96-e9f6-9ad6a6ad83d2';
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AbliiTermsAndConditions.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_ABLII_TC'
        }
      ]
    }
  ]
});
