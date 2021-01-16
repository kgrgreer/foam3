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
    net.nanopay.model.Business.BUSINESS_TYPE_ID.clone().copyFrom()
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        BusinessType businessType = findBusinessTypeId(x);
        if (businessType == null) {
          throw new IllegalStateException("Business type does not exist: " + getBusinessTypeId());
        }

        // Extra Business Type Data Required Capability
        final String capabilityId = "840FC3EB-F826-4AB3-AD92-131CD1C7C8D1";

        switch ( (int) businessType.getId() ) {
          case 3: // Corporation
          case 5: // LLC
          case 6: // Publicly traded company
            CrunchService crunchService = (CrunchService) x.get("crunchService");
            UserCapabilityJunction ucj = crunchService.getJunction(x, capabilityId);

            // UCJ must exist and be granted
            if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
              throw new IllegalStateException("Extra Business Type Data required for business type: " + getBusinessTypeId());
            }
        }
      `
    }
  ]
});
  