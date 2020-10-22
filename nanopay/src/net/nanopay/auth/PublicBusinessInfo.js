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
  package: 'net.nanopay.auth',
  name: 'PublicBusinessInfo',

  documentation: `Represents a public subset of a business's properties.`,

  javaImports: [
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessSector',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  properties: [
    net.nanopay.model.Business.ID,
    net.nanopay.model.Business.OPERATING_BUSINESS_NAME,
    net.nanopay.model.Business.BUSINESS_NAME,
    net.nanopay.model.Business.ORGANIZATION,
    net.nanopay.model.Business.ADDRESS,
    net.nanopay.model.Business.BUSINESS_SECTOR_ID,
  ].map((p) => p.clone().copyFrom({ visibility: 'RO' })),

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicBusinessInfo(X x, Business business) {
            if ( business == null ) {
              throw new RuntimeException("PublicBusinessInfo was given a null argument.");
            };
            DAO businessSectorDAO = (DAO) x.get("businessSectorDAO");
            BusinessSector businessSector = (BusinessSector) businessSectorDAO.find(business.getBusinessSectorId());
            setId(business.getId());
            setOperatingBusinessName(business.toSummary());
            setOrganization(business.getOrganization());
            setBusinessName(business.getBusinessName());
            setAddress(business.getAddress());
            setBusinessSectorId(business.getBusinessSectorId());
          }
        `);
      },
    },
  ],
  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.operatingBusinessName
          ? this.operatingBusinessName
          : this.organization
            ? this.organization
            : this.businessName
              ? this.businessName
              : this.firstName
                ? this.lastName
                  ? `${this.firstName} ${this.lastName}`
                  : this.firstName
                : 'Unknown';
      },
      javaCode: `
        return ! foam.util.SafetyUtil.isEmpty(getOperatingBusinessName()) ? getOperatingBusinessName() : 
          ! foam.util.SafetyUtil.isEmpty(getOperatingBusinessName()) ? getOperatingBusinessName() : 
          ! foam.util.SafetyUtil.isEmpty(getOrganization()) ? getOrganization() : 
          ! foam.util.SafetyUtil.isEmpty(getBusinessName()) ? getBusinessName() : "Unknown";
      `
    }
  ]
});
