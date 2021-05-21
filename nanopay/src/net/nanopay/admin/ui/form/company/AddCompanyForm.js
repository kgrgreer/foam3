/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddCompanyForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a company',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'notify',
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
        this.notify('First name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.jobTitle.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.jobTitle) ) {
        this.notify('Invalid job title.', '', this.LogLevel.ERROR, true);
        return;
      }
      if ( ! this.validateEmail(companyInfo.email) ) {
        this.notify('Invalid email address.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePhone(companyInfo.phoneNumber) ) {
        this.notify('Invalid phone number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePassword(companyInfo.password) ) {
        this.notify('Password must be at least 6 characters long.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.password != companyInfo.confirmPassword ) {
        this.notify('Confirmation password does not match.', '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },
    function profileValidations() {
      var companyInfo = this.viewData;

      if ( companyInfo.businessName.length > 35 ) {
        this.notify('Business name must be less than 35 characters long.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.registrationNumber.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.registrationNumber) ) {
        this.notify('Invalid registration number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.issuingAuthority.length > 0 && ! this.validateTitleNumOrAuth(companyInfo.issuingAuthority) ) {
        this.notify('Invalid issuing authority.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.website.length > 0 && ! this.validateWebsite(companyInfo.website) ) {
        this.notify('Invalid website.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateStreetNumber(companyInfo.streetNumber) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAddress(companyInfo.streetName) ) {
        this.notify('Invalid street name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( companyInfo.addressLine.length > 0 && ! this.validateAddress(companyInfo.addressLine) ) {
        this.notify('Invalid address line.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateCity(companyInfo.city) ) {
        this.notify('Invalid city name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePostalCode(companyInfo.postalCode, companyInfo.country) ) {
        this.notify('Invalid postal code.', '', this.LogLevel.ERROR, true);
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
          ( companyInfo.jobTitle == null || companyInfo.jobTitle.trim() == '' ) ||
          ( companyInfo.email == null || companyInfo.email.trim() == '' ) ||
          ( companyInfo.phoneNumber == null || companyInfo.phoneNumber.trim() == '' ) ||
          ( companyInfo.password == null || companyInfo.password.trim() == '' ) ) {
            this.notify('Please fill out all necessary fields before proceeding.', '', this.LogLevel.ERROR, true);
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
            this.notify('Please fill out all necessary fields before proceeding.', '', this.LogLevel.ERROR, true);
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

          var businessPhone = companyInfo.phoneNumber;

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
            this.notify(newBusiness.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }
          
          if ( businessAddress.errors_ ) {
            this.notify(businessAddress.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }

          this.userDAO.put(newBusiness).then(function(response) {
            self.notify('New business ' + companyInfo.businessName + ' successfully added!', '', self.LogLevel.INFO, true);
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.nextLabel = 'Done';
          }).catch(function(error) {
            self.notify(error.message, '', self.LogLevel.ERROR, true);
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
