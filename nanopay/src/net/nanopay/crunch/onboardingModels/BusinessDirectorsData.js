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
  name: 'BusinessDirectorsData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessDAO',
    'subject'
  ],

  requires: [
    'net.nanopay.model.BusinessUserJunction'
  ],

  javaImports: [
    'net.nanopay.model.BusinessDirector',
  ],

  messages: [
    { name: 'NO_DIRECTOR_INFO', message: 'Director information required' },
    { name: 'NO_DIR_NEEDED', message: 'No Business Directors required for this business type. Please proceed to next step.' }
  ],

  sections: [
    {
      name: 'directorsInfoSection',
      title: 'Director information',
      help: 'Require business director information'
    }
  ],

  properties: [
    {
      name: 'businessTypeId',
      class: 'Long',
      section: 'directorsInfoSection',
      hidden: true,
      storageTransient: true,
      expression: function() {
        this.businessDAO.find(this.subject.user.id).then(business => {
          this.businessTypeId = business.businessTypeId;
        });
      }
    },
    {
      class: 'String',
      name: 'noDirectorsNeeded',
      section: 'directorsInfoSection',
      getter: function() {
        return this.NO_DIR_NEEDED;
      },
      visibility: function(businessTypeId) {
        return businessTypeId === 3 || businessTypeId === 5 || businessTypeId === 6 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RO;
      }
    },
    {
      class: 'FObjectArray',
      name: 'businessDirectors',
      documentation: 'Array of business directors.',
      label: '',
      of: 'net.nanopay.model.BusinessDirector',
      section: 'directorsInfoSection',
      view: function(_, x) {
        return {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          mode: 'RW',
          enableAdding: true,
          enableRemoving: true,
          defaultNewItem: net.nanopay.model.BusinessDirector.create({
            type: x.data.subject.user.address.countryId
          }, x),
          name: 'director'
        };
      },
      visibility: function(businessTypeId) {
        return businessTypeId === 3 || businessTypeId === 5 || businessTypeId === 6 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      autoValidate: true,
      validationTextVisible: true,
      validationPredicates: [
        {
          args: [ 'businessTypeId', 'businessDirectors' ],
          predicateFactory: function(e) {
            return e.OR(
              e.HAS(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_DIRECTORS),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_TYPE_ID, 0),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_TYPE_ID, 1),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_TYPE_ID, 2),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_TYPE_ID, 4),
              e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_TYPE_ID, 7)
            );
          },
          errorMessage: 'NO_DIRECTOR_INFO'
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

          for ( BusinessDirector director : getBusinessDirectors()  ) director.validate(x);
        `
      }
    ]
  });
