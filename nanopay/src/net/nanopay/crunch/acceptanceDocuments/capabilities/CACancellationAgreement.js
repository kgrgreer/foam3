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
  name: 'CACancellationAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
  documentation: 'Verifies user understanding of cancellation under pad agreement terms',

  messages: [
    { name: 'ACKNOWLEDGE_STATEMENT', message: 'Must acknowledge the statement above.' },
    {
      name: 'CHECKBOX_MSG',
      message: 'This Authorization may be cancelled at any time upon notice being provided by me, ' +
        'either in writing or orally, with proper authorization to verify my identity. I acknowledge ' +
        'that I can obtain a sample cancellation form or further information on my right to cancel ' +
        'this Agreement from nanopay Corporation (for Canadian domestic transactions) or AFEX ' +
        '(for international transactions) or by visiting '
    }
  ],

  properties: [
    {
      name: 'checkboxText',
      factory: function() {
        return this.CHECKBOX_MSG;
      }
    },
    {
      name: 'title',
      value: 'www.payments.ca',
    },
    {
      name: 'link',
      value: 'https://www.payments.ca'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CACancellationAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_STATEMENT'
        }
      ]
    }
  ]
});
