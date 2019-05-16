foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboarding',
  ids: ['userId'],

  documentation: `Multifunctional model used for business onboarding`,

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business'
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
    },
    {
      name: 'signingOfficerQuestionSection',
      title: 'Are you considered a sigining officer at your company?',
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
      help: 'Awesome! Next, I’ll need to know your current home address…'
    },
    {
      name: 'signingOfficerEmailSection',
      title: 'Enter a signing officers email',
      help: `For security, we require the approval of a signing officer before you can continue.
          I can email your signing officers directly for the approval. Only 1 is required, but you can add as many as you like…`
    },
    {
      name: 'businessAddressSection',
      title: 'Enter your business address',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`
    },
    {
      name: 'businessDetailsSection',
      title: 'Enter your business details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`
    },
    {
      name: 'transactionDetailsSection',
      title: 'Enter your transaction details',
      help: `Thanks! That’s all the personal info I’ll need for now. Now let’s get some more details on your company…`
    },
    {
      name: 'ownershipYesOrNoSection',
      title: 'Does your company have anyone that owns 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document 
          the percentage of ownership of any individual with a 25% + stake in the company.`
    },
    {
      name: 'ownershipAmountSection',
      title: 'Does your company have anyone that owns 25% or more of the business?',
      help: `Great, almost done! In accordance with banking laws, we need to document 
          the percentage of ownership of any individual with a 25% + stake in the company.`
    },
    {
      name: 'personalOwnershipSection',
      title: 'Add the principle type and percentage of ownership details for yourself',
      help: `I’ve gone ahead and filled out the owner details for you, but I’ll need you to confirm your percentage of ownership…`

    },
    {
      name: 'beneficialOwnersSection',
      title: 'Add beneficial owners',
      help: `Next, I’ll need you to tell me some more details about the remaining owners who hold 25% + of the company…`
    },
    {
      name: 'agreementSection',
      title: 'Review the list of owners',
      help: 'Awesome! Just confirm the details you’ve entered are correct and we can proceed!'
    },
    {
      name: '2faSection',
      title: 'Protect your account against fraud with Two-factor authentication',
      help: `Alright, it looks like that is all of the information we need! Last thing I’ll ask 
          is that you enable two factor authentication. We want to make sure your account is safe!`
    }
  ],

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
    foam.nanos.auth.User.SIGNING_OFFICER.clone().copyFrom({
      section: 'signingOfficerQuestionSection'
    }),
    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      section: 'personalInformationSection'
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
      view: {
        class: 'foam.u2.CheckBox',
        label: 'I am a politically exposed persons or head of an international organization (PEP/HIO)'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'personalInformationSection',
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'homeAddressSection',
      view: {
        class: 'net.nanopay.sme.ui.AddressView'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'String',
      name: 'signingOfficerEmail',
      documentation: `Email for inviting signing officer to join the platform.
        We expect to have a string array in the future
        when we enable multiple signing officers`,
      section: 'signingOfficerEmailSection',
      validateObj: function(signingOfficerEmail) {
        return 'Email address is invalid.';
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.HIDDEN : foam.u2.Visibility.RW;
      }
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      section: 'businessAddressSection',
      view: {
        class: 'net.nanopay.sme.ui.AddressView',
        withoutCountrySelection: true
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID.clone().copyFrom({
      section: 'businessDetailsSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_SECTOR_ID.clone().copyFrom({
      section: 'businessDetailsSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetailsSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      section: 'businessDetailsSection',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetailsSection',
      visibilityExpression: function(signingOfficer, operatingUnderDifferentName) {
        return signingOfficer && operatingUnderDifferentName ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_AMOUNT.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_VOLUME.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.OTHER_TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetailsSection',
      visibilityExpression: function(signingOfficer, transactionPurpose) {
        return signingOfficer && transactionPurpose == 'Other' ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.TARGET_CUSTOMERS.clone().copyFrom({
      section: 'transactionDetailsSection',
      view: {
        class: 'foam.u2.tag.TextArea',
        placeholder: 'Example: Small manufacturing businesses in North America'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent',
      label: 'Does anyone own above 25% of the company?',
      section: 'ownershipYesOrNoSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No ( or this is a publicly traded company)',
          'Yes, we have owners with 25% +'
        ],
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Long',
      name: 'amountOfOwners',
      label: 'Amount of individuals who own 25%',
      section: 'ownershipAmountSection',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [ 1, 2, 3, 4, 5 ],
      },
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'userOwnsPercent',
      section: 'ownershipAmountSection',
      label: 'I am one of these owners',
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'principalType',
      section: 'personalOwnershipSection',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer, userOwnsPercent) {
        return signingOfficer && userOwnsPercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OWNERSHIP_PERCENT.clone().copyFrom({
      section: 'personalOwnershipSection',
      visibilityExpression: function(signingOfficer, userOwnsPercent) {
        return signingOfficer && userOwnsPercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'FObjectArray',
      name: 'beneficialOwners',
      of: 'net.nanopay.model.BeneficialOwner',
      section: 'beneficialOwnersSectionSection',
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate',
      section: 'agreementSection',
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I certify that all benefical owners with 25% or more ownership have been listed and the information included about them is accurate.'
      },
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    net.nanopay.model.Business.DUAL_PARTY_AGREEMENT.clone().copyFrom({
      section: 'agreementSection',
      view: {
        class: 'foam.u2.CheckBox',
        label: 'I acknowledge that I have read and accept the Dual Party Agreement for Ablii Canadian Payment Services.'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    })
  ],

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
