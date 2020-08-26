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
        title: 'Enter the directors information',
        help: 'require business director information'
      }
    ],
  
    properties: [
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
            }, this)
          }
        },
        visibility: function(businessTypeId, needDirector) {
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
        `
      }
    ]
  });
  