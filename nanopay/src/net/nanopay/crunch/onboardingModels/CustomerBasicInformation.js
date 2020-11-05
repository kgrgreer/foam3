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
  name: 'CustomerBasicInformation',
  documentation: `Basic information required from business customer or supplier`,

  messages: [
    { name: 'INVALID_PHONE_ERROR', message: 'Business phone number required' }
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'telephone',
      label: 'Business phone number',
      validationPredicates: [
        {
          args: ['telephone'],
          predicateFactory: function(e) {
            return e.REG_EXP(
              net.nanopay.crunch.onboardingModels.CustomerBasicInformation.TELEPHONE,
              foam.nanos.auth.Phone.PHONE_NUMBER_REGEX);
          },
          errorMessage: 'INVALID_PHONE_ERROR'
        }
      ]
    },
  ]
});
