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
  name: 'BusinessDetailExpandedData',

  documentation: `This model represents the expanded info of a Business that must be collect for onboarding.`,
  
  implements: [
    'foam.core.Validatable'
  ],
  
  properties: [
    net.nanopay.model.Business.BUSINESS_SECTOR_ID.clone().copyFrom(),
    net.nanopay.model.Business.SOURCE_OF_FUNDS.clone().copyFrom(),
    net.nanopay.model.Business.OPERATING_BUSINESS_NAME.clone().copyFrom(),
    net.nanopay.model.Business.TARGET_CUSTOMERS.clone().copyFrom(),
    net.nanopay.model.Business.SUGGESTED_USER_TRANSACTION_INFO.clone().copyFrom()
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
  