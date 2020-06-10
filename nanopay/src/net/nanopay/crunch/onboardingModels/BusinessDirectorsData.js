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
  
    messages: [
      { name: 'NO_DIRECTOR_INFO', message: 'Please enter director\'s information.' }
    ],

    sections: [
      {
        name: 'directorsInfoSection',
        title: 'Enter the directors information'
      }
    ],
  
    properties: [
      {
        name: 'reviewed',
        class: 'Boolean',
        section: 'directorsInfoSection',
        permissionRequired: true
      },
      {
        name: 'needDirector',
        class: 'Boolean',
        section: 'directorsInfoSection',
        hidden: true,
        transient: true,
        getter: function() {
          var self = this;
          this.businessDAO.find(this.subject.user.id).then((business) => {
            self.businessTypeId = business.businessTypeId;
          });
        }
      },
      {
        name: 'businessTypeId',
        class: 'Long',
        section: 'directorsInfoSection',
        hidden: true,
        storageTransient: true
      },
      {
        class: 'String',
        name: 'noDirectorsNeeded',
        section: 'directorsInfoSection',
        value: 'No Business Directors required for business type. Please proceed to next step.',
        visibility: function(businessTypeId, needDirector) {
          return businessTypeId === 3 || businessTypeId === 5 || businessTypeId === 6 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RO;
        }
      },
      {
        class: 'FObjectArray',
        name: 'businessDirectors',
        label: '',
        of: 'net.nanopay.model.BusinessDirector',
        section: 'directorsInfoSection',
        view: {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          mode: 'RW',
          enableAdding: true,
          enableRemoving: true,
          defaultNewItem: ''
        },
        visibility: function(businessTypeId, needDirector) {
          return businessTypeId === 3 || businessTypeId === 5 || businessTypeId === 6 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
        },
        autoValidate: true,
        validationTextVisible: true,
        validationPredicates: [
          {
            args: [ 'reviewed', 'businessTypeId', 'businessDirectors' ],
            predicateFactory: function(e) {
              return e.OR(
                e.HAS(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.BUSINESS_DIRECTORS),
                e.EQ(net.nanopay.crunch.onboardingModels.BusinessDirectorsData.REVIEWED, false),
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

          if ( ! this.getReviewed() ) {
            throw new IllegalStateException("Must confirm all data entered has been reviewed and is correct.");
          }
        `
      }
    ]
  });
  