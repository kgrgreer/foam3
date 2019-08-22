foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'CanadaUsBusinessOnboarding',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  implements: [
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
    'businessOnboardingDAO',
    'countryDAO',
    'ctrl',
  ],

  ids: ['userId'],

  tableColumns: [
    'userId',
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
        this.userId$find.then((user) => {
          if ( this.userId != n ) return;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
        });
      },
      tableCellFormatter: function(id, o) {
        var e = this.start('span').add(id).end();
        o.userId$find.then(function(b) {
          e.add(' - ', b.businessName || b.organization);
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
        var m = foam.mlang.Expressions.create();
        this.businessOnboardingDAO.find(
          m.AND(
            m.EQ(this.BusinessOnboarding.USER_ID, this.userId),
            m.EQ(this.BusinessOnboarding.BUSINESS_ID, this.businessId)
          )
        ).then((o) => {
          this.signingOfficer = o && o.signingOfficer ;
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
          errorString: 'Must be at least a before now.'
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
        var self = this;
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
      section: 'internationalTransactionSection',
      class: 'String',
      name: 'businessRegistrationNumber',
      label: 'Federal Tax ID Number (EIN) or Business Registration Number',
      documentation: 'Federal Tax ID Number (EIN) or Business Registration Number',
      visibilityExpression: function(countryOfBusinessFormation) {
        return countryOfBusinessFormation === 'US' ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['signingOfficer', 'businessRegistrationNumber', 'countryOfBusinessFormation'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.COUNTRY_OF_BUSINESS_FORMATION, 'CA'),
              e.EQ(net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.SIGNING_OFFICER, false),
              e.EQ(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding.BUSINESS_REGISTRATION_NUMBER
                }), 9),
            );
          },
          errorString: 'Please enter a valid Federal Tax ID Number (EIN) or Business Registration Number.'
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
    }
  ],

  methods: [
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
