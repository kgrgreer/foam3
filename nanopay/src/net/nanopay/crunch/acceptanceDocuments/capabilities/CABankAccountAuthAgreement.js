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
  name: 'CABankAccountAuthAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
  documentation: 'Verifies if the user has authorized nanopay or afex to debit and credit accounts (CA)',

  messages: [
    { name: 'ACKNOWLEDGE_STATEMENT', message: 'Must acknowledge the statement above' },
    { name: 'I_AUTHORIZE', message: 'I authorize ' },
    { name: 'TITLE_MSG',
      message: 'nanopay Corporation (for Canadian domestic transactions) or ' +
        'AFEX (for international transactions) to withdraw from my (debit) account ' +
        'with the financial institution listed above from time to time for the amount ' +
        'that I specify when processing a one-time ("sporadic") pre-authorized debit. ' +
        'I have agreed that we may reduce the standard period of pre-notification for ' +
        'variable amount PADs (Ablii Monthly Fee Invoice). We will send you notice of ' +
        'the amount of each Monthly Fee Invoice PAD five days before the PAD is due.'
    }
  ],

  properties: [
    {
      name: 'checkboxText',
      factory: function() {
        return this.I_AUTHORIZE;
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
              .CABankAccountAuthAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_STATEMENT'
        }
      ]
    }
  ]
});
