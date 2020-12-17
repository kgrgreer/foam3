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
  package: 'net.nanopay.crunch.registration',
  name: 'UserDetailExpandedData',

  documentation: `This model represents the expanded info of a User that must be collect for onboarding.`,

  messages: [
    { name: 'UNDER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'JOB_TITLE_REQUIRED', message: 'Job title required' }
  ],
  
  properties: [
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.AND(
              e.NEQ(net.nanopay.crunch.registration.UserDetailExpandedData.BIRTHDAY, null),
              e.LT(net.nanopay.crunch.registration.UserDetailExpandedData.BIRTHDAY, limit)
            );
          },
          errorString: 'Must be at least 18 years old.',
          errorMessage: 'UNDER_AGE_LIMIT_ERROR'
        }
      ]
    }),
    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      validationPredicates: [
        {
          args: ['jobTitle'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.registration.UserDetailExpandedData.JOB_TITLE, null);
          },
          errorString: 'Job title required.',
          errorMessage: 'JOB_TITLE_REQUIRED'
        }
      ]
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom(),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom()
  ]
});
  