foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'CanadaUsBusinessOnboarding',

  ids: ['userId', 'businessId'],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  requires: [
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
  ],

  imports: [
    'countryDAO',
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'net.nanopay.sme.onboarding.OnboardingStatus'
  ],

  tableColumns: [
    'userId',
    'businessId',
    'status',
    'created',
    'lastModified'
  ],

  sections: [
    {
      name: 'gettingStartedSection',
      title: 'Before you get started',
      help: `Welcome! I’m Joanne, and I’ll help you unlock international payments.`
    },
    {
      name: 'adminReferenceSection',
      title: 'Admin Reference Properties',
      permissionRequired: true,
    },
    {
      name: 'internationalTransactionSection',
      title: 'We need some more information about your business.',
      help: `Thanks! Now let’s get some more details on your US transactions`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
  ],

  properties: [ 
    {
      name: 'welcome',
      section: 'gettingStartedSection',
      flags: ['web'],
      transient: true,
      label: '',
      view: {
        class: 'net.nanopay.sme.onboarding.ui.IntroUSOnboarding'
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.sme.onboarding.OnboardingStatus',
      name: 'status',
      value: 'DRAFT',
      section: 'adminReferenceSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      section: 'adminReferenceSection',
      postSet: function(_, n) {
        try {
          this.userId$find.then((user) => {
            if ( this.userId != n ) return;
            this.firstName = user.firstName;
            this.lastName = user.lastName;
          });
        } catch (_) {
          // ignore error, this is here to catch the fact that userId is a copied property to a
          // multiPartId model but doesn't copy the postSet thus causing an error in the dao view.
        }
      },
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.userId$find.then((b) => {
          if ( ! b ) return;
          e.add(' - ', b.label());
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      label: 'Business Name',
      section: 'adminReferenceSection',
      postSet: function(_, n) {
        try {
          var m = foam.mlang.Expressions.create();
          this.businessId$find.then((business) => {
            if ( ! business ) return;
            business.signingOfficers.dao.find(m.EQ(this.User.ID, this.userId))
            .then((o) => {
              this.signingOfficer = o && o.id != 0;
            });
          });
        } catch (_) {
          // ignore error, this is here to catch the fact that userId/businessId is a copied property to a
          // multiPartId model but doesn't copy the postSet thus causing an error in the dao view.
        }
      },
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.businessId$find.then((b) => {
          if ( ! b ) return;
          e.add(' - ', b.label());
        });
      }
    },
    {
      documentation: 'Creation date.',
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
      section: 'adminReferenceSection',
    },
    {
      documentation: 'Last modified date.',
      name: 'lastModified',
      class: 'DateTime',
      visibility: 'RO',
      section: 'adminReferenceSection',
    },
    {
      class: 'Boolean',
      name: 'signingOfficer',
      hidden: true,
    },
    {
      section: 'internationalTransactionSection',
      class: 'Date',
      name: 'businessFormationDate',
      documentation: 'Date of Business Formation or Incorporation.',
      validationPredicates: [
        {
          args: ['signingOfficer','businessFormationDate'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              foam.mlang.predicate.OlderThan.create({
                arg1: net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.BUSINESS_FORMATION_DATE,
                timeMs: 24 * 60 * 60 * 1000
              })
            );
          },
          errorString: 'Business Formation Date must be a date in the past.'
        }
      ]
    },
    {
      section: 'internationalTransactionSection',
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryOfBusinessFormation',
      documentation: 'Country or Jurisdiction of Formation or Incorporation.',
      view: function(args, X) {
        var m = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: '- Please select -',
          dao: X.countryDAO.where(m.OR(
            m.EQ(foam.nanos.auth.Country.ID, 'CA')
          )),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'countryOfBusinessFormation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.COUNTRY_OF_BUSINESS_FORMATION, 'CA'),
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.COUNTRY_OF_BUSINESS_FORMATION, 'US')
            );
          },
          errorString: 'Ablii does not currently support businesses outside of Canada and the USA. We are working hard to change this! If you are based outside of Canada and the USA, check back for updates.'
        },
      ],
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      hidden: true
    },
    {
      section: 'internationalTransactionSection',
      class: 'String',
      name: 'taxIdentificationNumber',
      label: 'Federal Tax ID Number (EIN)',
      documentation: 'Federal Tax ID Number (EIN)',
      visibilityExpression: function(countryOfBusinessFormation) {
        return countryOfBusinessFormation === 'US' ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'taxIdentificationNumber', 'countryOfBusinessFormation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.COUNTRY_OF_BUSINESS_FORMATION, 'CA'),
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              e.REG_EXP(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.TAX_IDENTIFICATION_NUMBER,/^[0-9]{9}$/),
            );
          },
          errorString: 'Please enter a valid Federal Tax ID Number (EIN)'
        }
      ]
    },
    {
      section: 'internationalTransactionSection',
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'agreementAFEX',
      documentation: 'Verifies if the user has accepted CAD_AFEX_Terms.',
      docName: 'CAD_AFEX_Terms',
      label: '',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'agreementAFEX'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.AGREEMENT_AFEX, 0)
            );
          },
          errorString: 'Must acknowledge the AFEX agreement.'
        }
      ]
    },
    {
      section: 'internationalTransactionSection',
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'nanopayInternationalPaymentsCustomerAgreement',
      documentation: 'Verifies if the user has accepted nanopayInternationalPaymentsCustomerAgreement.',
      docName: 'nanopayInternationalPaymentsCustomerAgreement',
      label: '',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'nanopayInternationalPaymentsCustomerAgreement'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              e.NEQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.NANOPAY_INTERNATIONAL_PAYMENTS_CUSTOMER_AGREEMENT, 0)
            );
          },
          errorString: 'Must acknowledge the nanopay International Payments Customer Agreement.'
        }
      ]
    }
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to update a submitted onboard profile.'
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO canadaUsBusinessOnboardingDAO = (DAO) x.get("canadaUsBusinessOnboardingDAO");

        CanadaUsBusinessOnboarding obj = (CanadaUsBusinessOnboarding) this;
        CanadaUsBusinessOnboarding oldObj = (CanadaUsBusinessOnboarding) canadaUsBusinessOnboardingDAO.find(this.getId());

        if ( auth.check(x, "onboarding.update.*") ) return;

        if (
          oldObj != null &&
          oldObj.getStatus() == OnboardingStatus.SUBMITTED &&
          oldObj.getSigningOfficer()
        ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }

        if ( obj.getStatus() == OnboardingStatus.SUBMITTED ) super.validate(x);
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "canadaUsBusinessOnboarding.create." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "canadaUsBusinessOnboarding.read." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "canadaUsBusinessOnboarding.update." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) x.get("agent");
        if ( user == null ) user = (foam.nanos.auth.User) x.get("user");

        if ( user.getId() == getUserId() ) return;

        String permission = "canadaUsBusinessOnboarding.delete." + getId();
        foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
        if ( auth.check(x, permission) ) return;

        throw new foam.nanos.auth.AuthorizationException();
      `
    }
  ]
  
});
