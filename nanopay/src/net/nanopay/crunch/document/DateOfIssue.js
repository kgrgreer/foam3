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
  package: 'net.nanopay.crunch.document',
  name: 'DateOfIssue',
  mixins: ['foam.u2.wizard.AbstractWizardletAware'],

  messages: [
    { name: 'FUTURE_DATE_ERROR', message: 'Date of issue cannot be a future date' },
    { name: 'INVALID_DATE_ERROR', message: 'Please provide the date of issue as shown on your identification' }
  ],

  sections: [
    {
      name: 'dateOfIssueSection',
      title: 'When was your identification document Issued',
      help: 'Enter the date of issue of your identification document, previously loaded.'
    }
  ],

  properties: [
    ['customUpdateSlot', true],
    {
      class: 'Date',
      name: 'dateOfIssue',
      section: 'dateOfIssueSection',
      label: 'Date of Issue',
      documentation: 'The date of issue on the document',
      help: 'Please provide the date of issue as shown on your identification.',
      validationPredicates: [
        {
          args: ['dateOfIssue'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.document.DateOfIssue.DATE_OF_ISSUE, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['dateOfIssue'],
          predicateFactory: function(e) {
            var today = new Date();
            return e.LT(net.nanopay.crunch.document.DateOfIssue.DATE_OF_ISSUE, today);
          },
          errorMessage: 'FUTURE_DATE_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'getUpdateSlot',
      code: function () {
        return this.dateOfIssue$;
      }
    }
  ]
});
