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
  name: 'RecourseAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
  documentation: 'Verifies user understanding of recourse and reimbursement of pad agreement',

  messages: [
    { name: 'ACKNOWLEDGE_STATEMENT', message: 'Must acknowledge the statement above' },
    {
      name: 'CHECKBOX_MSG',
      message: 'I have certain recourse rights if any debit does not comply with this agreement. ' +
        'For example, I have right to receive reimbursement for any debit that is not authorized or ' +
        'is not consistent with the PAD agreement. To obtain more information on my recourse rights, ' +
        'I may contact my financial institution'
    },
    { name: 'OR', message: ' or ' }
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
      class: 'String',
      name: 'subLink',
      value: 'https://www.payments.ca',
      readVisibility: 'RO',
      section: 'uiAgreementDocumentsSection'
    },
    {
      name: 'fileId',
      factory: function() {
        return '488eedba-b34a-4b61-9f6d-1c501f13dcc7';
      }
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .RecourseAgreement.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_STATEMENT'
        }
      ],
      view: function(_, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .start('a')
                .add(self.dot('checkboxText'))
                .attrs({
                  href: self.dot('link'),
                  target: '_blank'
                })
              .end()
              .add(' or ')
              .start('a')
                .addClass('link')
                .add(self.dot('title'))
                .attrs({
                  href: self.dot('subLink'),
                  target: '_blank'
                })
              .end()
            .end();
          }
        });
      }
    }
  ]
});
