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
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a merchant',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'balanceDAO',
    'email',
    'formatCurrency',
    'notify',
    'validatePhone',
    'validatePassword',
    'validateEmail',
    'validatePostalCode',
    'validateWebsite',
    'validateStreetNumber',
    'validateCity',
    'validateAddress',
    'validateTitleNumOrAuth',
    'stack',
    'transactionDAO',
    'user',
    'userDAO',
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addMerchant', id: 'form-addMerchant-info',      label: 'Merchant Info',    view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-profile',   label: 'Business Profile', view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-sendMoney', label: 'Send Money',       view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-review',    label: 'Review',           view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-done',      label: 'Done',             view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
      ];
      this.SUPER();
    },
    function infoValidations() {
      var merchantInfo = this.viewData;

      if ( merchantInfo.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( merchantInfo.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( !this.validatePhone(merchantInfo.phoneNumber) ) {
        this.notify('Invalid phone number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePassword(merchantInfo.password) ) {
        this.notify('Password must be at least 6 characters long.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( merchantInfo.password != merchantInfo.confirmPassword ) {
        this.notify('Confirmation password does not match.', '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },
    function profileValidations() {
      var merchantInfo = this.viewData;

      if ( merchantInfo.businessName.length > 35 ) {
        this.notify('Business name must be less than 35 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateEmail(merchantInfo.companyEmail) ) {
        this.notify('Invalid email address.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( merchantInfo.registrationNumber.length > 0 && ! this.validateTitleNumOrAuth(merchantInfo.registrationNumber) ) {
        this.notify('Invalid registration number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( merchantInfo.website.length > 0 && ! this.validateWebsite(merchantInfo.website) ) {
        this.notify('Invalid website.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateStreetNumber(merchantInfo.streetNumber) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAddress(merchantInfo.streetName) ) {
        this.notify('Invalid street name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( merchantInfo.addressLine.length > 0 && ! this.validateAddress(merchantInfo.addressLine) ) {
        this.notify('Invalid address line.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateCity(merchantInfo.city) ) {
        this.notify('Invalid city name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePostalCode(merchantInfo.postalCode, merchantInfo.country) ) {
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
        if ( this.position === 0 || this.position > 3 ) {
          X.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        } else {
          this.subStack.back();
        }
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function(X) {
        var self = this;

        // Info from form
        var merchantInfo = this.viewData;

        if ( this.position == 0 ) {
          // Merchant Info

          // Validations
          if ( ( merchantInfo.firstName == null || merchantInfo.firstName.trim() == '' ) ||
          ( merchantInfo.lastName == null || merchantInfo.lastName.trim() == '' ) ||
          ( merchantInfo.phoneNumber == null || merchantInfo.phoneNumber.trim() == '' ) ||
          ( merchantInfo.password == null || merchantInfo.password.trim() == '' ) ) {
            this.notify('Please fill out all nececssary fields before proceeding.', '', this.LogLevel.ERROR, true);
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
          if ( ( merchantInfo.businessName == null || merchantInfo.businessName.trim() == '' ) ||
          ( merchantInfo.companyEmail == null || merchantInfo.companyEmail.trim() == '' ) ||
          ( merchantInfo.registrationNumber == null || merchantInfo.registrationNumber.trim() == '' ) ||
          ( merchantInfo.streetNumber == null || merchantInfo.streetNumber.trim() == '' ) ||
          ( merchantInfo.streetName == null || merchantInfo.streetName.trim() == '' ) ||
          ( merchantInfo.city == null || merchantInfo.city.trim() == '' ) ||
          ( merchantInfo.postalCode == null || merchantInfo.postalCode.trim() == '' ) ) {
            this.notify('Please fill out all nececssary fields before proceeding.', '', this.LogLevel.ERROR, true);
            return;
          }

          if ( ! this.profileValidations() ) {
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 2 ) {
          // Send Money
          this.balanceDAO.find(this.user.id).then(function(response) {
            var currentBalance = response;
            if ( merchantInfo.amount > currentBalance.balance ) {
              self.notify('Amount entered is more than current balance.', '', this.LogLevel.ERROR, true);
              return;
            }
            if ( merchantInfo.amount == 0 || merchantInfo.amount == null ) {
              merchantInfo.amount = 0;
            }
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          });
        }

        if ( this.position == 3 ) {
          // Review

          var merchantPhone = merchantInfo.phoneNumber;

          var merchantAddress = this.Address.create({
            address1: merchantInfo.streetNumber + ' ' + merchantInfo.streetName,
            streetNumber: merchantInfo.streetNumber,
            streetName: merchantInfo.streetName,
            suite: merchantInfo.addressLine,
            city: merchantInfo.city,
            postalCode: merchantInfo.postalCode,
            countryId: merchantInfo.country,
            regionId: merchantInfo.province
          });

          var newMerchant = this.User.create({
            firstName: merchantInfo.firstName,
            lastName: merchantInfo.lastName,
            organization: merchantInfo.businessName,
            businessName: merchantInfo.businessName,
            email: merchantInfo.companyEmail,
            type: 'Merchant',
            group: 'ccMerchant',
            phone: merchantPhone,
            address: merchantAddress,
            desiredPassword: merchantInfo.password,
            profilePicture: merchantInfo.profilePicture,
            businessIdentificationNumber: merchantInfo.registrationNumber,
            website: merchantInfo.website,
            businessTypeId: merchantInfo.businessType,
            businessSectorId: merchantInfo.businessSector,
            portalAdminCreated: true
          });

          if ( newMerchant.errors_ ) {
            this.notify(newMerchant.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }
          if ( merchantAddress.errors_ ) {
            this.notify(merchantAddress.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }

          this.userDAO.put(newMerchant).then(function(response) {
            merchantInfo.merchant = response;
          }).then(function() {
            if ( merchantInfo.amount > 0 ) {
              var transaction = self.Transaction.create({
                payeeId: merchantInfo.merchant.id,
                payerId: self.user.id,
                amount: merchantInfo.amount
              });
              return self.transactionDAO.put(transaction).then( function(response) {
                self.notify('New merchant ' + merchantInfo.businessName + ' sucessfully added and value transfer sent.', '', self.LogLevel.INFO, true);
                self.subStack.push(self.views[self.subStack.pos + 1].view);
                self.nextLabel = 'Done';
              });
            } else {
              self.notify('New merchant ' + merchantInfo.businessName + ' successfully added.', '', self.LogLevel.INFO, true);
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = 'Done';
              return;
            }
          }).catch(function(error) {
            self.notify(error.message, '', self.LogLevel.ERROR, true);
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
