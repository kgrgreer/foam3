foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboarding',
  ids: ['userId'],

  documentation: `Multifunctional model used for business onboarding`,

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business',
  ],

  sections: [
    {
      name: 'gettingStartedSection',
      title: 'Before you get started',
      help: 'Welcome! I’m Joanne, and I’ll help you unlock the full power of Ablii.'
    },
    {
      name: 'adminReferenceSection',
      title: 'Admin Reference Properties',
      permissionRequired: true,
    },
    {
      name: 'signingOfficerQuestionSection',
      title: 'Are you considered a signing officer at your company?',
      help: 'Alright, let’s do this! First off, I’m going to need to know if you are a signing officer at your company…'
    },
    {
      name: 'personalInformationSection',
      title: 'Personal Information',
      help: 'Thanks, now I’ll need a bit of personal information so I can verify your identity…'
    },
    {
      name: 'homeAddressSection',
      title: 'Enter you home address',
      help: 'Awesome! Next, I’ll need to know your current home address…',
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter a signing officers email',
      help: `For security, we require the approval of a signing officer before you can continue.
          I can email your signing officers directly for the approval. Only 1 is required, but you can add as many as you like…`,
      isAvailable: function (signingOfficer) { return !signingOfficer }
    },
    {
      name: 'businessAddressSection',
      title: 'Enter your business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'businessDetailsSection',
      title: 'Enter your business details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'transactionDetailsSection',
      title: 'Enter your transaction details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'ownershipYesOrNoSection',
      title: 'Does your company have anyone that owns 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
      isAvailable: function (signingOfficer) { return signingOfficer }
    },
    {
      name: 'ownershipAmountSection',
      title: 'How many people own 25% or more of your company?',
      help: `Great, almost done! In accordance with banking laws, we need to document
          the percentage of ownership of any individual with a 25% + stake in the company.`,
      isAvailable: function (signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent
      }
    },
    {
      name: 'personalOwnershipSection',
      title: 'Add the principle type and percentage of ownership details for yourself',
      help: `I’ve gone ahead and filled out the owner details for you, but I’ll need you to confirm your percentage of ownership…`,
      isAvailable: function (signingOfficer, userOwnsPercent) { return signingOfficer && userOwnsPercent }
    },
    {
      name: 'owner1Section',
      title: 'Add for owner #1',
      help: `Next, I’ll need you to tell me some more details about the remaining owners who hold 25% + of the company…`,
      isAvailable: function(signingOfficer, userOwnsPercent, ownershipAbovePercent, amountOfOwners) {
        return signingOfficer && ownershipAbovePercent && amountOfOwners >= 1 && ! userOwnsPercent;
      }
    },
    [2, 3, 4].map((i) => ({
      name: `owner${i}Section`,
      title: `Add for owner #${i}`,
      help: `Next, I’ll need you to tell me some more details about the remaining owners who hold 25% + of the company…`,
      isAvailable: function(signingOfficer, ownershipAbovePercent, amountOfOwners) {
        return signingOfficer && ownershipAbovePercent && amountOfOwners >= i;
      }
    })),
    {
      name: 'reviewOwnersSection',
      title: 'Review the list of owners',
      help: 'Awesome! Just confirm the details you’ve entered are correct and we can proceed!',
      isAvailable: function (signingOfficer, ownershipAbovePercent) { return signingOfficer && ownershipAbovePercent }
    },
    {
      name: '2faSection',
      title: 'Protect your account against fraud with Two-factor authentication',
      help: `Alright, it looks like that is all of the information we need! Last thing I’ll ask
          is that you enable two factor authentication. We want to make sure your account is safe!`
    }
  ].flat(),

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      section: 'adminReferenceSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      section: 'adminReferenceSection'
    },
    {
      class: 'String',
      name: 'firstName',
      flags: ['web'],
      transient: true,
      section: 'adminReferenceSection'
    },
    {
      class: 'String',
      name: 'lastName',
      flags: ['web'],
      transient: true,
      section: 'adminReferenceSection'
    },

    foam.nanos.auth.User.SIGNING_OFFICER.clone().copyFrom({
      section: 'signingOfficerQuestionSection',
      help: `A signing officer is a person legally authorized to act on behalf of the business (e.g CEO, COO, board director)`,
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes, I am a signing officer'],
          [false, 'No, I am not'],
        ],
      },
    }),
    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      section: 'personalInformationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Chief Visionary Officer'
      }
    }),
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      section: 'personalInformationSection'
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      section: 'personalInformationSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'personalInformationSection',
      label: '',
      label2: 'I am a politically exposed persons or head of an international organization (PEP/HIO)',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'personalInformationSection',
      label: '',
      label2: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    // FIXME: We need to give a link to the Dual Party Agreement
    net.nanopay.model.Business.DUAL_PARTY_AGREEMENT.clone().copyFrom({
      section: 'personalInformationSection',
      label: '',
      label2: 'I acknowledge that I have read and accept the Dual Party Agreement for Ablii Canadian Payment Services.',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'homeAddressSection',
      view: {
        class: 'net.nanopay.sme.ui.AddressView'
      }
    }),
    {
      class: 'String',
      name: 'signingOfficerEmail',
      label: 'Enter your signing officer\'s email',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      section: 'signingOfficerEmailSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'example@email.com'
      },
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      section: 'businessAddressSection',
      view: {
        class: 'net.nanopay.sme.ui.AddressView',
      },
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID.clone().copyFrom({
      label: 'Type of business',
      section: 'businessDetailsSection',
      placeholder: 'Select...',
    }),
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'businessSectorId',
      section: 'businessDetailsSection',
      documentation: 'Represents the specific economic grouping for the business.',
      label: 'Nature of business (NAIC code)',
      view: { class: 'net.nanopay.business.NatureOfBusiness' }
    },

    // FIXME: Turn into a dropdown
    foam.nanos.auth.User.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetailsSection',
      label: 'Primary source of funds',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          'Purchase of goods produced',
          'Completion of service contracts',
          'Investment Income',
          'Brokerage Fees',
          'Consulting Fees',
          'Sale of investments',
          'Inheritance',
          'Grants, loans, and other sources of financing',
          'Other'
        ]
      },
    }),
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      label: 'Does your business operate under a different name?',
      section: 'businessDetailsSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No'],
        ],
      }
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetailsSection',
      visibilityExpression: function(operatingUnderDifferentName) {
        return operatingUnderDifferentName ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_AMOUNT.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_VOLUME.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Select...',
        choices: [
          'Payables for products and/or services',
          'Working capital',
          'Bill payments',
          'Intracompany bank transfers',
          'Government fee and taxes',
          'Other'
        ]
      },
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.OTHER_TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      visibilityExpression: function(transactionPurpose) {
        return  transactionPurpose == 'Other' ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.TARGET_CUSTOMERS.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.tag.TextArea',
        placeholder: 'Example: Small manufacturing businesses in North America'
      },
    }),
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent',
      label: 'Does anyone own above 25% of the company?',
      section: 'ownershipYesOrNoSection',
      postSet: function(_, n) {
        if ( ! n ) this.amountOfOwners = 0;
      },
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [false, 'No ( or this is a publicly traded company)'],
          [true, 'Yes, we have owners with 25% +']
        ],
      },
    },
    {
      class: 'Long',
      name: 'amountOfOwners',
      label: 'Amount of individuals who own 25%',
      section: 'ownershipAmountSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 1, 2, 3, 4 ],
      },
      validateObj: function(ownershipAbovePercent, amountOfOwners) {
        return ownershipAbovePercent &&
          ! ( amountOfOwners >= 1 && amountOfOwners <= 4 ) ? 'Please select a value' : null;
      }
    },
    {
      class: 'Boolean',
      name: 'userOwnsPercent',
      section: 'ownershipAmountSection',
      label: '',
      label2: 'I am one of these owners',
      postSet: function(_, n) {
        this.clearProperty('owner1');
        if ( ! n ) return;
        this.owner1.jobTitle$.follow(this.jobTitle$);
        this.owner1.firstName$.follow(this.firstName$);
        this.owner1.lastName$.follow(this.lastName$);
        this.owner1.birthday$.follow(this.birthday$);
        this.owner1.address$.follow(this.address$);
      }
    },
    {
      class: 'String',
      name: 'roJobTitle',
      label: 'Job Title',
      expression: function(jobTitle) {
        return jobTitle;
      },
      section: 'personalOwnershipSection',
      visibility: foam.u2.Visibility.RO
    },
    foam.nanos.auth.User.OWNERSHIP_PERCENT.clone().copyFrom({
      section: 'personalOwnershipSection',
    }),
    [1, 2, 3, 4].map((i) => ({
      class: 'FObjectProperty',
      of: 'net.nanopay.model.BeneficialOwner',
      name: `owner${i}`,
      section: `owner${i}Section`,
      view: {
        class: 'foam.u2.detail.SectionView',
        sectionName: 'requiredSection',
        showTitle: false
      },
      label: '',
      flags: ['web'],
      factory: function() {
        return this.BeneficialOwner.create();
      }
    })),
    {
      class: 'FObjectArray',
      name: 'beneficialOwners',
      of: 'net.nanopay.model.BeneficialOwner',
      hidden: true,
      postSet: function(_, n) {
        n.forEach((o, i) => {
          this['owner'+i] = o;
        });
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      of: 'net.nanopay.model.BeneficialOwner',
      name: 'beneficialOwnersTable',
      flags: ['web'],
      section: 'reviewOwnersSection',
      expression: function(beneficialOwners) {
        var dao = foam.dao.EasyDAO.create({
          of: 'net.nanopay.model.BeneficialOwner',
          seqNo: true,
          daoType: 'MDAO'
        });
        beneficialOwners.forEach((o) => dao.put(o));
        return dao;
      },
      view: {
        class: 'foam.u2.view.TableView',
        editColumnsEnabled: false,
        disableUserSelection: true,
        columns: [
          'firstName',
          'lastName',
          'jobTitle'
        ]
      }
    },
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate',
      section: 'reviewOwnersSection',
      label: '',
      label2: 'I certify that all beneficial owners with 25% or more ownership have been listed and the information included about them is accurate.'
    },
  ].flat(),

  reactions: [
    ['', 'amountOfOwners', 'updateBeneficialOwners'],
    ['', 'propertyChange.userId', 'updateUserInfo']
  ].concat([1, 2, 3, 4].map((i) => [
    `owner${i}`, 'propertyChange', 'updateBeneficialOwners'
  ])),

  listeners: [
    {
      name: 'updateBeneficialOwners',
      isFramed: true,
      code: function() {
        this.beneficialOwners = [
          this.owner1,
          this.owner2,
          this.owner3,
          this.owner4
        ].slice(0, this.amountOfOwners);
      }
    },
    {
      name: 'updateUserInfo',
      code: function() {
        this.userId$find.then((user) => {
          this.firstName = user.firstName;
          this.lastName = user.lastName;
        });
      }
    }
  ]

  // actions: [
  //   async function save(X){
  //     var self = this;
  //     // This is a rough idea of how the values collected from the model will be translated to the appropriate objects and DAO's.
  //     // Requires work.
  //     var business = await X.businessDAO.find(this.businessId ? this.businessId : X.user);
  //     var user = await X.userDAO.find(this.userId ? this.userId : X.agent);

  //     // Append values to user
  //     user.phone = this.phone;
  //     user.birthday = this.birthday;
  //     user.address = this.address;

  //     var employee = user;
  //     employee.signingOfficer = this.signingOfficer;
  //     employee.PEPHIORelated = this.PEPHIORelated;
  //     employee.thirdParty = this.thirdParty;
  //     this.businessAddress.regionId = business.regionId ? business.regionId : this.businessAddress.regionId;
  //     this.businessAddress.countryId = business.countryId ? business.countryId : this.businessAddress.countryId;
  //     business.address = this.businessAddress;
  //     business.businessTypeId = this.businessTypeId;
  //     business.businessSectorId = this.businessSectorId;
  //     business.sourceOfFunds = this.sourceOfFunds;
  //     business.operatingBusinessName = this.operatingBusinessName;

  //     var suggestedUserTransactionInfo = net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.create({
  //       annualTransactionAmount: this.annualTransactionAmount,
  //       annualVolume: this.annualVolume,
  //       transactionPurpose: this.transactionPurpose,
  //       otherTransactionPurpose: this.otherTransactionPurpose
  //     });

  //     business.suggestedUserTransactionInfo = suggestedUserTransactionInfo;

  //     this.beneficialOwners.forEach(function(beneficialOwner) {
  //       self.business.beneficialOwners.add(beneficialOwner);
  //     });

  //     var user = await X.userDAO.put(user);
  //     var business = await X.businessDAO.put(business);
  //   }
  // ]
});
