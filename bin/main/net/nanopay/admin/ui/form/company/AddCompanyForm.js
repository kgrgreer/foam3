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
    'validateEmail',
    'validatePhone',
    'validatePassword',
    'validatePostalCode',
    'validateStreetNumber',
    'validateCity',
    'validateWebsite',
    'validateAddress',
    'validateTitleNumOrAuth',
    'user',
    'transactionDAO'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addCompany', id: 'form-addCompany-info',           label: 'User Info',                   view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyInfoForm' } },
        { parent: 'addCompany', id: 'form-addCompany-profile',        label: 'Business Profile',            view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyProfileForm' } },
        { parent: 'addCompany', id: 'form-addCompany-review',         label: 'Review',                      view: { class: 'net.nanopay.admin.ui.form.company.AddCompanyReviewForm' } },
        { parent: 'addCompany', id: 'form-addCompany-done',           label: 'Done',                        view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
      ];
      this.SUPER();
    },
    function infoValidations() {
      var companyInfo = this.viewData;

      if ( companyInfo.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( companyInfo.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( companyInfo.jobTitle.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.jobTitle) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid job title.', type: 'error' }));
        return;
      }
      if ( ! this.validateEmail(companyInfo.email) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePhone(companyInfo.phoneNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePassword(companyInfo.password) ) {
        this.add(this.NotificationMessage.create({ message: 'Password must be at least 6 characters long.', type: 'error' }));
        return false;
      }
      if ( companyInfo.password != companyInfo.confirmPassword ) {
        this.add(this.NotificationMessage.create({ message: 'Confirmation password does not match.', type: 'error' }));
        return false;
      }

      return true;
    },
    function profileValidations() {
      var companyInfo = this.viewData;

      if ( companyInfo.businessName.length > 35 ) {
        this.add(this.NotificationMessage.create({ message: 'Business name must be less than 35 characters.', type: 'error' }));
        return false;
      }
      if ( companyInfo.registrationNumber.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.registrationNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid registration number.', type: 'error' }));
        return false;
      }
      if ( companyInfo.issuingAuthority.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.issuingAuthority) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid issuing authority', type: 'error' }));
        return false;
      }
      if ( companyInfo.website.length > 0 && ! this.validateWebsite(companyInfo.website) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid website.', type: 'error' }));
        return false;
      }
      if ( ! this.validateStreetNumber(companyInfo.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAddress(companyInfo.streetName) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
        return false;
      }
      if ( companyInfo.addressLine.length > 0 && ! this.validateAddress(companyInfo.addressLine) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
        return false;
      }
      if ( ! this.validateCity(companyInfo.city) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePostalCode(companyInfo.postalCode, companyInfo.country) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
        return false;
      }

      return true;
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

          if ( ! this.infoValidations() ) {
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

          if ( ! this.profileValidations() ) {
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
            group: 'business',
            phone: businessPhone,
            address: businessAddress,
            desiredPassword: companyInfo.password,
            profilePicture: companyInfo.profilePicture,
            businessIdentificationNumber: companyInfo.registrationNumber,
            website: companyInfo.website,
            businessTypeId: companyInfo.businessType,
            businessSectorId: companyInfo.businessSector,
            portalAdminCreated: true
          });

          if ( newBusiness.errors_ ) {
            this.add(this.NotificationMessage.create({ message: newBusiness.errors_[0][1], type: 'error' }));
            return;
          }
          if ( businessPhone.errors_ ) {
            this.add(this.NotificationMessage.create({ message: businessPhone.errors_[0[1]], type: 'error' }));
            return;
          }
          if ( businessAddress.errors_ ) {
            this.add(this.NotificationMessage.create({ message: businessAddress.errors_[0][1], type: 'error' }));
            return;
          }

          this.userDAO.put(newBusiness).then(function(response) {
            self.add(self.NotificationMessage.create({ message: 'New business ' + companyInfo.businessName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.nextLabel = 'Done';
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
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
