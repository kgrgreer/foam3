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
  package: 'net.nanopay.crunch',
  name: 'BusinessOwnershipToBeneficialOwnerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    A decorator to convert the crunch data to beneficialOwners to store into the beneficialOwnerDAO.
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.crunch.onboardingModels.BusinessOwnershipData',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj instanceof BusinessOwnershipData ) {
          BusinessOwnershipData businessOwnerData = (BusinessOwnershipData) obj.fclone();

          DAO businessDAO = (DAO) getX().get("businessDAO");
          Business business = (Business) businessDAO.find(businessOwnerData.getBusinessId());
          if ( business != null ) {
            business.getBeneficialOwners(x).removeAll(); // To avoid duplicating on updates
            for ( BeneficialOwner bo : businessOwnerData.getOwners() ) {
              business.getBeneficialOwners(getX()).put(bo);
            }
          }
        }
        return null;
      `
    }
  ]
});
