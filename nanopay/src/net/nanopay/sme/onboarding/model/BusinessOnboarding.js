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
    foam.nanos.auth.User.PHONE.clone().copyFrom({
      view: {
        class: 'net.nanopay.ui.PhoneView'
      }
    }),
    foam.nanos.auth.User.BIRTHDAY,
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      view: {
        class: 'foam.u2.CheckBox',
        label: 'I am a politically exposed persons or  head of an international organization (PEP/HIO)'
      }
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      view: { 
        class: 'foam.u2.CheckBox',
        label: 'I am taking instructions from and/or conducting transactions on behalf of a 3rd party'
      }
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      view: {
        class: 'net.nanopay.sme.ui.AddressView'
      }
    }),
    {
      class: 'Array',
      of: 'String',
      name: 'signingOfficeEmails',
      documentation: 'Business signing officer emails. To be sent invitations to join platform'
    },
    foam.nanos.auth.User.BUSINESS_ADDRESS.clone().copyFrom({
      view: {
        class: 'net.nanopay.sme.ui.AddressView',
        withoutCountrySelection: true
      }
    }),
    foam.nanos.auth.User.BUSINESS_TYPE_ID,
    foam.nanos.auth.User.BUSINESS_SECTOR_ID,
    foam.nanos.auth.User.SOURCE_OF_FUNDS,
    {
      class: 'Boolean',
      name: 'operatingUnderDifferentName'
    },
    foam.nanos.auth.User.OPERATING_BUSINESS_NAME,
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_AMOUNT,
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_VOLUME,
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE,
    net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.OTHER_TRANSACTION_PURPOSE,
    {
      class: 'Boolean',
      name: 'ownershipAbovePercent'
    },
    {
      class: 'Long',
      name: 'amountOfIndividualsWhoOwnPercent'
    },
    {
      class: 'Boolean',
      name: 'userOwnsPercent'
    },
    foam.nanos.auth.User.OWNERSHIP_PERCENT,
    foam.nanos.auth.User.PRINCIPAL_TYPE,
    {
      class: 'Boolean',
      name: 'certifyAllInfoIsAccurate'
    },
    {
      class: 'Boolean',
      name: 'TermsAgreement'
    },
    {
      class: 'FObjectArray',
      name: 'beneficialOwners',
      of: 'foam.nanos.auth.User'
    }
  ],

  actions: [
    async function save(X){
      var self = this;

      var business = await X.businessDAO.find(X.user ? X.user : this.businessId);
      var user = await X.userDAO.find(X.agent ? X.agent : this.userId);


      // Append values to user
      user.phone = this.phone;
      user.birthday = this.birthday;
      user.address = this.address;

      var employee = user;
      employee.signingOfficer = this.signingOfficer;
      employee.PEPHIORelated = this.PEPHIORelated;
      employee.thirdParty = this.thirdParty;

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
