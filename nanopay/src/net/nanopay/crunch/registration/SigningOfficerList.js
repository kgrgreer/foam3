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
  name: 'SigningOfficerList',

  documentation: `This model represents the signing officers of a business.`,
  
  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessType'
  ],
  
  properties: [
    {
      class: 'Reference',
      name: 'business',
      targetDAOKey: 'businessDAO',
      of: 'net.nanopay.model.Business',
      documentation: 'Onboarded business',
      externalTransient: true
    },
    {
      class: 'FObjectArray',
      name: 'signingOfficers',
      of: 'net.nanopay.model.SigningOfficer',
      documentation: 'Array of signing officers.'
    }
  ],
  
  methods: [
    {
      name: 'validate',
      javaCode: `
        // There must be at least one director
        if ( getSigningOfficers().length == 0 ) {
          throw new IllegalStateException("Signing officers empty");
        }

        // Validate the owners individually
        for ( net.nanopay.model.SigningOfficer officer : getSigningOfficers() ) 
        {
          officer.validate(x);  
        }

        // The business must exist
        Business business = findBusiness(x);
        if ( business == null ) {
          throw new IllegalStateException("Business not set or does not exist: " + getBusiness());
        }
      `
    }
  ]
});
