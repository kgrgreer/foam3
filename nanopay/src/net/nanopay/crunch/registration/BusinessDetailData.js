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
  extends: 'net.nanopay.crunch.registration.NamedBusiness',

  documentation: `This model represents the basic info of a Business that must be collect for onboarding.`,
  
  implements: [
    'foam.core.Validatable'
  ],
  
  properties: [
    net.nanopay.model.Business.BUSINESS_NAME.clone().copyFrom(),
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
          args: ['address', 'address$errors_'],
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
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
  