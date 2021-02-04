/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.crunch.bepay',
  name: 'ExtendedUserDetailsData',

  documentation: `This model represents the expanded info of a User that must be collect for BePay onboarding.`,

  messages: [
    { name: 'INVALID_DATE_ERROR', message: 'Valid date of birth required' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be under the age of 125 years old' }
  ],

  properties: [
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      label: 'Date of birth',
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.bepay.ExtendedUserDetailsData.BIRTHDAY, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.LT(net.nanopay.crunch.bepay.ExtendedUserDetailsData.BIRTHDAY, limit);
          },
          errorMessage: 'UNGER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.GT(net.nanopay.crunch.bepay.ExtendedUserDetailsData.BIRTHDAY, limit);
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ]
    }),
    {
      class: 'String',
      name: 'mothersMaidenName',
      label: 'mother\'s maiden name'
    }
  ]
});
