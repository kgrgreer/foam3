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
  name: 'AbliiPrivacyPolicy',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  imports: [
    'appConfig'
  ],

  messages: [
    { name: 'ACKNOWLEDGE_PRIVACY_POLICY', message: 'Must acknowledge the Privacy Policy' }
  ],

  properties: [
    {
      name: 'title',
      value: `Ablii's Privacy Policy`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'fileId',
      factory: function() {
        return '81aaec42-b38e-fb90-3200-58bcb39542b7';
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AbliiPrivacyPolicy.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_PRIVACY_POLICY'
        }
      ]
    }
  ]
});
