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
  name: 'BusinessOwnerList',

  documentation: `This model represents the owners of a business.`,
  
  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'net.nanopay.model.Business'
  ],
  
  properties: [
    {
      class: 'Reference',
      name: 'business',
      targetDAOKey: 'businessDAO',
      of: 'net.nanopay.model.Business',
      documentation: 'Onboarded business'
    },
    {
      class: 'FObjectArray',
      name: 'businessOwners',
      of: 'net.nanopay.model.BeneficialOwner',
      documentation: 'Array of business owners.'
    }
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        // The business must exist
        Business business = findBusiness(x);
        if ( business == null ) {
          throw new IllegalStateException("Business does not exist: " + getBusiness());
        }

        // There must be at least one owner
        if ( getBusinessOwners().length == 0 ) {
          throw new IllegalStateException("Business owners empty");
        }

        // Validate the owners individually
        for ( net.nanopay.model.BeneficialOwner owner : getBusinessOwners() ) 
        {
          owner.validate(x);  
        }
      `
    }
  ]
});
  