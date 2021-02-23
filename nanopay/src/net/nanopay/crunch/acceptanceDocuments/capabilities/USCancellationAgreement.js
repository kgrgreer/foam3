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
  name: 'USCancellationAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
  documentation: 'Verifies user understanding of cancellation under pad agreement terms',

  messages: [
    { name: 'ACKNOWLEDGE_STATEMENT', message: 'Must acknowledge the statement above' },
    {
      name: 'TITLE_MSG',
      message: 'This authority is to remain in effect until AFEX has received written ' +
        'notification from me/us of its change or termination. The notification must be ' +
        'received at least 10 business days before the next debit Is scheduled at the ' +
        'address provided below. AFEX shall advise me/us of any dishonored fees, and ' +
        'I/we agree to pay them.'
    }
  ],

  properties: [
    {
      name: 'checkboxText',
      factory: function() {
        return null;
      }
    },
    {
      name: 'title',
      factory: function() {
        return this.TITLE_MSG;
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .USCancellationAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_STATEMENT'
        }
      ]
    }
  ]
});
