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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessLastRegistrationDateData',

  implements: [ 'foam.mlang.Expressions' ],

  sections: [
    {
      name: 'businessLastRegistrationDateSection',
      title: 'Date of the last Contractual Amendment or Minutes',
      help: 'Enter business last registration date'
    },
  ],

  messages: [
    { name: 'INVALID_DATE_ERROR', message: 'Please enter the most recent date in which your business was registered' },
    { name: 'MIN_DATE_ERROR', message: 'Business last registration must be a more recent date' },
    { name: 'MAX_DATE_ERROR', message: 'Business last registration cannot be a future date' }
  ],

  properties: [
    {
      section: 'businessLastRegistrationDateSection',
      name: 'businessLastRegistrationDate',
      label: 'Insert the date of the last Contractual Amendment or Minutes',
      class: 'Date',
      documentation: 'Date of Business last Registration.',
      validationPredicates: [
        {
          args: ['businessLastRegistrationDate'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.BusinessLastRegistrationDateData.BUSINESS_LAST_REGISTRATION_DATE, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['businessLastRegistrationDate'],
          predicateFactory: function(e) {
            var min = new Date();
            min.setDate(min.getDate() - ( 350 * 365 ));
            return e.GTE(net.nanopay.crunch.onboardingModels.BusinessLastRegistrationDateData.BUSINESS_LAST_REGISTRATION_DATE, min);
          },
          errorMessage: 'MIN_DATE_ERROR'
        },
        {
          args: ['businessLastRegistrationDate'],
          predicateFactory: function(e) {
            return e.LTE(net.nanopay.crunch.onboardingModels.BusinessLastRegistrationDateData.BUSINESS_LAST_REGISTRATION_DATE, new Date());
          },
          errorMessage: 'MAX_DATE_ERROR'
        }
      ]
    }
  ]
});
