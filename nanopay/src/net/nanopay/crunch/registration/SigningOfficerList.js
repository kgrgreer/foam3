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
      documentation: 'Onboarded business'
    },
    {
      class: 'List',
      name: 'signingOfficers',
      documentation: 'List of user that are signing officers.',
      javaType: 'java.util.ArrayList<java.lang.Long>',
      view: {
        class: 'foam.u2.view.ReferenceArrayView',
        daoKey: 'userDAO'
      }
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

        // There must be at least one director
        if ( getSigningOfficers().size() == 0 ) {
          throw new IllegalStateException("Signing officers empty");
        }

        // Validate the directors individually
        DAO userDAO = (DAO) x.get("localUserDAO");
        for ( Long userId : getSigningOfficers() ) 
        {
          if (userDAO.find(userId) == null) {
            throw new IllegalArgumentException(userId + " not found for signing officer for business " + getBusiness());
          }
        }
      `
    }
  ]
});
  