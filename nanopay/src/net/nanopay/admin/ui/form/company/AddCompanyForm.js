foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddCompanyForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a company',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'stack',
    'userDAO',
    'user',
    'transactionDAO'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addCompany', id: 'form-addCompany-info',      label: 'User Info',        view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyInfoForm' } },
        { parent: 'addCompany', id: 'form-addCompany-profile',   label: 'Business Profile', view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyProfileForm' } },
        { parent: 'addCompany', id: 'form-addCompany-review',    label: 'Review',           view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyReviewForm' } },
        { parent: 'addCompany', id: 'form-addCompany-done',      label: 'Done',             view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      code: function(X) {
        if ( this.position === 0 || this.position > 2 ) {
          X.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        } else {
          this.subStack.back();
        }
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function() {
        var self = this;

        // Info from form
        var companyInfo = this.viewData;

        if ( this.position == 0 ) { 
          // Merchant Info

          if ( ( companyInfo.firstName == null || companyInfo.firstName.trim() == '' ) ||
          ( companyInfo.firstName == null || companyInfo.firstName.trim() == '' ) || 
          ( companyInfo.jobTitle == null || companyInfo.jobTitle.trim() == '' ) ||
          ( companyInfo.email == null || companyInfo.email.trim() == '' ) ||
          ( companyInfo.phoneNumber == null || companyInfo.phoneNumber.trim() == '' ) ||
          ( companyInfo.password == null || companyInfo.password.trim() == '' ) ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(companyInfo.phoneNumber) ) {
            this.add(self.NotificationMessage.create({ message: 'Phone number is invalid.', type: 'error' }));
            return; 
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;

        }

        if ( this.position == 1 ) {
          // Business Profile

          if ( ( companyInfo.businessName == null || companyInfo.businessName.trim() == '' ) ||
          ( companyInfo.registrationNumber == null || companyInfo.registrationNumber.trim() == '' ) ||
          ( companyInfo.streetNumber == null || companyInfo.streetNumber.trim() == '' ) ||
          ( companyInfo.streetName == null || companyInfo.streetName.trim() == '' ) ||
          ( companyInfo.city == null || companyInfo.city.trim() == '' ) ||
          ( companyInfo.postalCode == null || companyInfo.postalCode.trim() == '' ) ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;

        }

        if ( this.position == 2 ) {
          // Review

          var businessPhone = this.Phone.create({
            number: companyInfo.phoneNumber
          });

          var businessAddress = this.Address.create({
            address1: companyInfo.streetNumber + ' ' + companyInfo.streetName,
            streetNumber: companyInfo.streetNumber,
            streetName: companyInfo.streetName,
            suite: companyInfo.addressLine,
            city: companyInfo.city,
            postalCode: companyInfo.postalCode,
            countryId: companyInfo.country,
            regionId: companyInfo.province
          });

          var newBusiness = this.User.create({
            firstName: companyInfo.firstName,
            lastName: companyInfo.lastName,
            organization: companyInfo.businessName,
            businessName: companyInfo.businessName,
            email: companyInfo.email,
            issuingAuthority: companyInfo.issuingAuthority,
            department: companyInfo.jobTitle,
            type: 'Business',
            group: (this.user.group==='s2hAdmin'?'s2hCustomer':'business'),
            phone: businessPhone,
            address: businessAddress,
            password: companyInfo.password,
            businessIdentificationNumber: companyInfo.registrationNumber,
            website: companyInfo.website,
            businessTypeId: companyInfo.businessType,
            businessSectorId: companyInfo.businessSector
          });
          this.userDAO.put(newBusiness).then(function(response) {
            companyInfo.business = response;
            self.add(self.NotificationMessage.create({ message: 'New business ' + companyInfo.businessName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.nextLabel = 'Done';
            return;
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            return;
          });

        }


        if ( this.subStack.pos == this.views.length - 1 ) {
          // Done
          return this.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        }

      }
    }
  ]
});