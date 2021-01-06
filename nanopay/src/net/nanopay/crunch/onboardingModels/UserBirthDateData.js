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
  name: 'UserBirthDateData',

  implements: [ 'foam.mlang.Expressions' ],

  sections: [
    {
      name: 'signingOfficerPersonalInformationSection',
      title: 'Please enter the signing officer\'s date of birth',
      navTitle: 'Signing officer\’s date of birth',
      help: 'Require your date of birth.'
    },
  ],

  messages: [
    { name: 'INVALID_DATE_ERROR', message: 'Valid date of birth required' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be under the age of 125 years old' }
  ],

  properties: [
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      section: 'signingOfficerPersonalInformationSection',
      label: 'Date of birth',
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.UserBirthDateData.BIRTHDAY, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.LT(net.nanopay.crunch.onboardingModels.UserBirthDateData.BIRTHDAY, limit);
          },
          errorMessage: 'UNGER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.GT(net.nanopay.crunch.onboardingModels.UserBirthDateData.BIRTHDAY, limit);
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ]
    })
  ]
});
