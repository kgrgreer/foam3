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

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId'
    },
    foam.nanos.auth.User.SIGNING_OFFICER,
    foam.nanos.auth.User.JOB_TITLE,
    foam.nanos.auth.User.PHONE,
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      view: {
        class: 'foam.u2.CheckBox',
        label: 'I am a politically exposed persons or head of an international organization (PEP/HIO)'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      view: {
        class: 'net.nanopay.sme.ui.AddressView'
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Array',
      of: 'String',
      name: 'signingOfficeEmails',
      documentation: 'Business signing officer emails. To be sent invitations to join platform',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.HIDDEN : foam.u2.Visibility.RW;
      }
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      view: {
        class: 'net.nanopay.sme.ui.AddressView',
        withoutCountrySelection: true
      },
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.BUSINESS_SECTOR_ID.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    foam.nanos.auth.User.SOURCE_OF_FUNDS.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_AMOUNT.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_VOLUME.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.OTHER_TRANSACTION_PURPOSE.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Long',
      name: 'amountOfIndividualsWhoOwnPercent',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'userOwnsPercent',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    foam.nanos.auth.User.OWNERSHIP_PERCENT.clone().copyFrom({
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }),
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'TermsAgreement',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'FObjectArray',
      name: 'beneficialOwners',
      of: 'foam.nanos.auth.User',
      visibilityExpression: function(signingOfficer) {
        return signingOfficer ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      }
    }
  ],

  actions: [
    async function save(X){
      var self = this;

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
