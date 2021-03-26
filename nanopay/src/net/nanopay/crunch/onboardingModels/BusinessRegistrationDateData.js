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
  name: 'BusinessRegistrationDateData',

  implements: [ 'foam.mlang.Expressions' ],

  sections: [
    {
      name: 'businessRegistrationDateSection',
      title: 'Business registration date',
      help: 'Enter business registration date'
    },
  ],

  messages: [
    { name: 'INVALID_DATE_ERROR', message: 'Valid business registration date required' },
    { name: 'MIN_DATE_ERROR', message: 'Business registration must be a more recent date' },
    { name: 'MAX_DATE_ERROR', message: 'Business registration cannot be a future date' }
  ],

  properties: [
    {
      section: 'businessRegistrationDateSection',
      name: 'businessRegistrationDate',
      label: 'Input date of first registration of business',
      class: 'Date',
      documentation: 'Date of Business Registration.',
      validationPredicates: [
        {
          args: ['businessRegistrationDate'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['businessRegistrationDate'],
          predicateFactory: function(e) {
            var min = new Date();
            min.setDate(min.getDate() - ( 350 * 365 ));
            return e.GTE(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, min);
          },
          errorMessage: 'MIN_DATE_ERROR'
        },
        {
          args: ['businessRegistrationDate'],
          predicateFactory: function(e) {
            return e.LTE(net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.BUSINESS_REGISTRATION_DATE, new Date());
          },
          errorMessage: 'MAX_DATE_ERROR'
        }
      ]
    }
  ]
});
