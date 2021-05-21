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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'BusinessTypeAndSector',

  documentation: `
    This model collects the business type and business sector data.
  `,

  implements: [
    'foam.core.Validatable'
  ],

  imports: [
    'businessTypeDAO',
    'subject'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  sections: [
    {
      name: 'businessDetailsSection',
      title: 'Type of business and sector'
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'BUSINESS_TYPE_ERROR', message: ' Business type required' },
    { name: 'NATURE_OF_BUSINESS_ERROR', message: 'Business sector required' }
  ],

  properties: [
    net.nanopay.model.Business.BUSINESS_TYPE_ID.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Type of business',
      documentation: 'The ID of the proprietary details of the business. This ID is found by querying the businessTypeDAO.',
      view: function(_, X) {
        return {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            dao: X.businessTypeDAO,
            objToChoice: function(a) {
              return [a.id, a.name];
          }
        };
      },
      validationPredicates: [
        {
          args: ['businessTypeId'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.BusinessTypeAndSector.BUSINESS_TYPE_ID, 0);
          },
          errorMessage: 'BUSINESS_TYPE_ERROR'
        }
      ],
      gridColumns: 12
    }),
    {
      section: 'businessDetailsSection',
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'businessSectorId',
      documentation: 'The ID of the general economic grouping for the business. This ID is found by querying the businessSectorDAO.',
      label: 'Business sector',
      view: function(_, X) {
        var c = X.data.subject.user.address.countryId;
        var d = X.data.businessSectorId;

        return {
          class: 'net.nanopay.business.NatureOfBusiness',
          country:  c == 'BR' ? c : '',
          data: d ? d : 0
        };
      },
      validationPredicates: [
        {
          args: ['businessSectorId'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.onboardingModels.BusinessTypeAndSector.BUSINESS_SECTOR_ID, 0);
          },
          errorMessage: 'NATURE_OF_BUSINESS_ERROR'
        }
      ]
    }
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

        DAO userDAO = (DAO) x.get("userDAO");
        Long businessId = ((User) ((Subject) x.get("subject")).getUser()).getId();
        User businessUser = (User) (userDAO.find(businessId)).fclone();
        Business business = (Business) businessUser;
        business.setBusinessTypeId(getBusinessTypeId());
        userDAO.inX(x).put(business);
      `,
    }
  ]
});
