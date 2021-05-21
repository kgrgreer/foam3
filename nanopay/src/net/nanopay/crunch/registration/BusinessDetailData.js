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
  name: 'BusinessDetailData',

  documentation: `This model represents the basic info of a Business that must be collect for onboarding.`,

  messages: [
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address' },
    { name: 'BUSINESS_NAME_REQUIRED', message: 'Business name required' }
  ],

  properties: [
    net.nanopay.model.Business.BUSINESS_NAME.clone().copyFrom({
      validationPredicates: [
        {
          args: ['businessName'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.crunch.registration.BusinessDetailData.BUSINESS_NAME, null),
              e.NEQ(net.nanopay.crunch.registration.BusinessDetailData.BUSINESS_NAME, ""));
          },
          errorString: 'Business name required.',
          errorMessage: 'BUSINESS_NAME_REQUIRED'
        }
      ]
    }),
    net.nanopay.model.Business.PHONE_NUMBER.clone().copyFrom(),
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.registration.BusinessDetailData.ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    net.nanopay.model.Business.MAILING_ADDRESS.clone().copyFrom({
      autoValidate: false,
      validationPredicates: [
        {
          args: ['mailingAddress', 'mailingAddress$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.registration.BusinessDetailData.MAILING_ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    net.nanopay.model.Business.EMAIL.clone().copyFrom()
  ]
});
