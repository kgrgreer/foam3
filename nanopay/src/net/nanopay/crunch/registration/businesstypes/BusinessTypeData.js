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
  package: 'net.nanopay.crunch.registration.businesstypes',
  name: 'BusinessTypeData',

  documentation: `This model represents the business type of a business.`,
  
  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.model.BusinessType'
  ],
  
  properties: [
    net.nanopay.model.Business.BUSINESS_TYPE_ID,
    {
      class: 'Boolean',
      name: 'selected',
      value: false,
      documentation: 'Whether the associated capability is selected'
    }
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        BusinessType businessType = findBusinessTypeId(x);
        if (businessType == null) {
          throw new IllegalStateException("Business type does not exist: " + getBusinessTypeId());
        }

        if ( ! getSelected() ) {
          throw new IllegalStateException("Capability not selected");
        }
      `
    }
  ]
});
