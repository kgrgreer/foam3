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
  name: 'UserDetailData',

  documentation: `This model represents the basic info of a User that must be collect for onboarding.`,

  messages: [
    { name: 'FIRST_NAME_REQUIRED', message: 'First name required' },
    { name: 'LAST_NAME_REQUIRED', message: 'First name required' }
  ],

  properties: [
    foam.nanos.auth.User.FIRST_NAME.clone().copyFrom({
      validationPredicates: [
        {
          args: ['firstName'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.crunch.registration.UserDetailData.FIRST_NAME, null),
              e.NEQ(net.nanopay.crunch.registration.UserDetailData.FIRST_NAME, ""));
          },
          errorString: 'First name required.',
          errorMessage: 'FIRST_NAME_REQUIRED'
        }
      ]
    }),
    foam.nanos.auth.User.LAST_NAME.clone().copyFrom({
      validationPredicates: [
        {
          args: ['lastName'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.crunch.registration.UserDetailData.LAST_NAME, null),
              e.NEQ(net.nanopay.crunch.registration.UserDetailData.LAST_NAME, ""));
          },
          errorString: 'Last name required.',
          errorMessage: 'LAST_NAME_REQUIRED'
        }
      ]
    }),
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom(),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom()

    // leaving out username and email and password as they should be set when creating the user
  ]
});
  