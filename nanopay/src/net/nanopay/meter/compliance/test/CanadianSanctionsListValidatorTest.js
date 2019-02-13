foam.CLASS({
  package: 'net.nanopay.meter.compliance.test',
  name: 'CanadianSanctionsListValidatorTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record',
    'net.nanopay.meter.compliance.validator.CanadianSanctionsListValidator',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setUp(x);
        CanadianSanctionsListValidatorTest_canValidate_User_and_Business_type(x);
        CanadianSanctionsListValidatorTest_validate_individual_by_name(x);
        CanadianSanctionsListValidatorTest_validate_business_by_name(x);
      `
    },
    {
      name: 'setUp',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        validator_            = new CanadianSanctionsListValidator();
        canadianSanctionDAO_  = (DAO) x.get("canadianSanctionDAO");
        userDAO_              = (DAO) x.get("localUserDAO");
        businessDAO_          = (DAO) x.get("localBusinessDAO");

        // Clean sanction dao
        canadianSanctionDAO_.removeAll();

        // Add bad user
        badUser_ = (User) userDAO_.find(MLang.EQ(User.EMAIL, "baduser@nanopay.net"));
        badUser_ = badUser_ == null
          ? new User.Builder(x)
            .setEmail("baduser@nanopay.net")
            .setEmailVerified(true)
            .setFirstName("Bad")
            .setLastName("User").build()
          : (User) badUser_.fclone();
        userDAO_.put(badUser_);

        // Add bad business
        badBusiness_ = (Business) businessDAO_.find(MLang.EQ(User.EMAIL, "badbusiness@nanopay.net"));
        badBusiness_ = badBusiness_ == null
          ? new Business.Builder(x)
            .setEmail("badbusiness@nanopay.net")
            .setEmailVerified(true)
            .setBusinessName("Bad business").build()
          : (Business) badBusiness_.fclone();
        businessDAO_.put(badBusiness_);
      `
    },
    {
      name: 'CanadianSanctionsListValidatorTest_canValidate_User_and_Business_type',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        test(
          validator_.canValidate(new User())
          , "Can validate User type."
        );
        test(
          validator_.canValidate(new Business())
          , "Can validate Business type."
        );
      `
    },
    {
      name: 'CanadianSanctionsListValidatorTest_validate_individual_by_name',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        Record record = new Record.Builder(x)
          .setGivenName("Bad")
          .setLastName("User").build();

        test(
          validator_.validate(x, badUser_) == ComplianceValidationStatus.VALIDATED
          , "Validate returns VALIDATED status when user is not in sanction list."
        );

        canadianSanctionDAO_.put(record);
        test(
          validator_.validate(x, badUser_) == ComplianceValidationStatus.REJECTED
          , "Validation returns REJECTED status when user is in sanction list."
        );
      `
    },
    {
      name: 'CanadianSanctionsListValidatorTest_validate_business_by_name',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        Record record = new Record.Builder(x)
          .setEntity("Bad business").build();

        test(
          validator_.validate(x, badBusiness_) == ComplianceValidationStatus.VALIDATED
          , "Validate returns VALIDATED status when business is not in sanction list."
        );
        canadianSanctionDAO_.put(record);

        test(
          validator_.validate(x, badBusiness_) == ComplianceValidationStatus.REJECTED
          , "Validate returns VALIDATED status when business is in sanction list."
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private CanadianSanctionsListValidator validator_;
          private DAO canadianSanctionDAO_;
          private DAO userDAO_;
          private DAO businessDAO_;
          private User badUser_;
          private Business badBusiness_;
        `);
      }
    }
  ]
});
