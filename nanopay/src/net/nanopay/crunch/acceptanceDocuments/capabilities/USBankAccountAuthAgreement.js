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
  name: 'USBankAccountAuthAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
  documentation: 'Verifies if the user has authorized nanopay or afex to debit and credit accounts (US)',

  messages: [
    { name: 'ACKNOWLEDGE_STATEMENT', message: 'Must acknowledge the statement above' },
    { name: 'TITLE_MSG',
      message: 'I/We authorize Associated Foreign Exchange Inc (AFEX) and the financial ' +
        'institution designated (or any other financial institution I/we may authorize at ' +
        'any time) to deduct regular and/or one-time payments as per my/our instructions ' +
        'for payment of all charges arising under my/our AFEX account(s) In accordance ' +
        'with this Authorization and the applicable rules of the National Automated Clearing ' +
        'House Association(ACH). AFEX will provide notice for each amount debited.'
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
              .USBankAccountAuthAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_STATEMENT'
        }
      ]
    }
  ]
});

