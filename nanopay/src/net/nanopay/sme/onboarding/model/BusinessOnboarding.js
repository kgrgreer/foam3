foam.CLASS({
  package: 'net.nanopay.sme.onboarding.model',
  name: 'BusinessOnboarding',

  documentation: `Multifunctional model used for business onboarding`,

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business'
  ],

  sections: [
    {
      name: 'adminReference',
      title: 'Admin Reference Properties'
    },
    {
      name: 'signingOfficerQuestion',
      title: 'Are you considered a sigining officer at your company?'
    },
    {
      name: 'personalInformation',
      title: 'Personal Information'
    },
    {
      name: 'homeAddress',
      title: 'Enter you home address'
    },
    {
      name: 'signingOfficerEmails',
      title: 'Enter a signing officers email'
    },
    {
      name: 'businessAddress',
      title: 'Enter your business address'
    },
    {
      name: 'businessDetails',
      title: 'Enter your business details'
    },
    {
      name: 'transactionDetails',
      title: 'Enter your transaction details'
    },
    {
      name: 'ownershipYesOrNo',
      title: 'Does your company have anyone that owns 25% or more of the business?'
    },
    {
      name: 'ownershipAmount',
      title: 'Does your company have anyone that owns 25% or more of the business?'
    },
    {
      name: 'personalOwnership',
      title: 'Add the principle type and percentage of ownership details for yourself'
    },
    {
      name: 'beneficialOwners',
      title: 'Add beneficial owners'
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      section: 'adminReference'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      section: 'adminReference'
    },
    foam.nanos.auth.User.SIGNING_OFFICER.clone().copyFrom({
      section: 'signingOfficerQuestion'
    }),
    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      section: 'personalInformation'
    }),
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      section: 'personalInformation'
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      section: 'personalInformation',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      section: 'personalInformation',
      view: {
        class: 'foam.u2.CheckBox',
        label: 'I am a politically exposed persons or head of an international organization (PEP/HIO)'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      section: 'personalInformation',
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'homeAddress',
      view: {
        class: 'net.nanopay.sme.ui.AddressView'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'FObjectArray',
      of: 'net.nanopay.model.EmailAddress',
      name: 'signingOfficerEmails',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      section: 'signingOfficerEmails',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.HIDDEN : foam.u2.Visibility.RW;
      }
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      section: 'businessAddress',
      view: {
        class: 'net.nanopay.sme.ui.AddressView',
        withoutCountrySelection: true
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID.clone().copyFrom({
      section: 'businessDetails',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_SECTOR_ID.clone().copyFrom({
      section: 'businessDetails',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.SOURCE_OF_FUNDS.clone().copyFrom({
      section: 'businessDetails',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      section: 'businessDetails',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME.clone().copyFrom({
      section: 'businessDetails',
      visibilityExpression: function(signingOfficer, operatingUnderDifferentName) {
        return signingOfficer && operatingUnderDifferentName ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_AMOUNT.clone().copyFrom({
      section: 'transactionDetails',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_VOLUME.clone().copyFrom({
      section: 'transactionDetails',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetails',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.OTHER_TRANSACTION_PURPOSE.clone().copyFrom({
      section: 'transactionDetails',
      visibilityExpression: function(signingOfficer, transactionPurpose) {
        return signingOfficer & transactionPurpose == 'Other' ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent',
      label: 'Does anyone own above 25% of the company?',
      section: 'ownershipYesOrNo',
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
      section: 'ownershipAmount',
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
      section: 'ownershipAmount',
      label: 'I am one of these owners',
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'principalType',
      section: 'personalOwnership',
      documentation: 'Change to option dropdown',
      visibilityExpression: function(signingOfficer, userOwnsPercent) {
        return signingOfficer && userOwnsPercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OWNERSHIP_PERCENT.clone().copyFrom({
      section: 'personalOwnership',
      visibilityExpression: function(signingOfficer, userOwnsPercent) {
        return signingOfficer && userOwnsPercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'FObjectArray',
      name: 'beneficialOwners',
      of: 'foam.nanos.auth.User',
      section: 'beneficialOwners',
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate',
      section: 'beneficialOwners',
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I certify that all benefical owners with 25% or more ownership have been listed and the information included about them is accurate.'
      },
      visibilityExpression: function(signingOfficer, ownershipAbovePercent) {
        return signingOfficer && ownershipAbovePercent ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'TermsAgreement',
      section: 'beneficialOwners',
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I acknowledge that I have read and accept the Dual Party Agreement for Ablii Canadian Payment Services.'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }
  ],

  actions: [
    async function save(X){
      var self = this;
      // This is a rough idea of how the values collected from the model will be translated to the appropriate objects and DAO's.
      // Requires work.
      var business = await X.businessDAO.find(this.businessId ? this.businessId : X.user);
      var user = await X.userDAO.find(this.userId ? this.userId : X.agent);

      // Append values to user
      user.phone = this.phone;
      user.birthday = this.birthday;
      user.address = this.address;

      var employee = user;
      employee.signingOfficer = this.signingOfficer;
      employee.PEPHIORelated = this.PEPHIORelated;
      employee.thirdParty = this.thirdParty;
      this.businessAddress.regionId = business.regionId ? business.regionId : this.businessAddress.regionId;
      this.businessAddress.countryId = business.countryId ? business.countryId : this.businessAddress.countryId;
      business.address = this.businessAddress;
      business.businessTypeId = this.businessTypeId;
      business.businessSectorId = this.businessSectorId;
      business.sourceOfFunds = this.sourceOfFunds;
      business.operatingBusinessName = this.operatingBusinessName;

      var suggestedUserTransactionInfo = net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.create({
        annualTransactionAmount: this.annualTransactionAmount,
        annualVolume: this.annualVolume,
        transactionPurpose: this.transactionPurpose,
        otherTransactionPurpose: this.otherTransactionPurpose
      });

      business.suggestedUserTransactionInfo = suggestedUserTransactionInfo;

      this.beneficialOwners.forEach(function(beneficialOwner) {
        self.business.beneficialOwners.add(beneficialOwner);
      });

      var user = await X.userDAO.put(user);
      var business = await X.businessDAO.put(business);
    }
  ]
}); 
