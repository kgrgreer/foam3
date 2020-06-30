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
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a shopper',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  imports: [
    'currentAccount',
    'balanceDAO',
    'email',
    'formatCurrency',
    'group',
    'notify',
    'validateEmail',
    'validateAge',
    'validatePhone',
    'validateStreetNumber',
    'validateAddress',
    'validatePostalCode',
    'validateCity',
    'validatePassword',
    'stack',
    'transactionDAO',
    'user',
    'userDAO'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addShopper', id: 'form-addShopper-info',      label: 'Shopper Info', view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperInfoForm' } },
        { parent: 'addShopper', id: 'form-addShopper-sendMoney', label: 'Send Money',   view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm' } },
        { parent: 'addShopper', id: 'form-addShopper-review',    label: 'Review',       view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperReviewForm' } },
        { parent: 'addShopper', id: 'form-addShopper-done',      label: 'Done',         view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
      ];
      this.SUPER();
    },
    function validations () {
      var shopperInfo = this.viewData;

      if ( shopperInfo.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( shopperInfo.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateEmail(shopperInfo.emailAddress) ) {
        this.notify('Invalid email address.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePhone(shopperInfo.phoneNumber) ) {
        this.notify('Invalid phone number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAge(shopperInfo.birthday) ) {
        this.notify('User should be at least 16 years of age to register.', '', this.LogLevel.ERROR, true);
        return;
      }
      if ( ! this.validateStreetNumber(shopperInfo.streetNumber) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAddress(shopperInfo.streetName) ) {
        this.notify('Invalid street name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( shopperInfo.addressLine.length > 0 && ! this.validateAddress(shopperInfo.addressLine) ) {
        this.notify('Invalid address line.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateCity(shopperInfo.city) ) {
        this.notify('Invalid city name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePostalCode(shopperInfo.postalCode, 'CA') ) {
        this.notify('Invalid postal code.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePassword(shopperInfo.password) ) {
        this.notify('Password must be at least 6 characters long.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( shopperInfo.password != shopperInfo.confirmPassword ) {
        this.notify('Confirmation password does not match.', '', this.LogLevel.ERROR, true);
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
      code: function(X) {
        var self = this;

        // Info from form
        var shopperInfo = this.viewData;

        if ( this.position == 0 ) {
          // Shopper Info

          // Validations
          if ( ( shopperInfo.firstName == null || shopperInfo.firstName.trim() == '' ) ||
          ( shopperInfo.lastName == null || shopperInfo.lastName.trim() == '' ) ||
          ( shopperInfo.emailAddress == null || shopperInfo.emailAddress.trim() == '' ) ||
          ( shopperInfo.phoneNumber == null || shopperInfo.phoneNumber.trim() == '' ) ||
          ( shopperInfo.birthday == null || shopperInfo.birthday == 'yyyy-mm-dd' ) ||
          ( shopperInfo.streetNumber == null || shopperInfo.streetNumber.trim() == '' ) ||
          ( shopperInfo.streetName == null || shopperInfo.streetName.trim() == '' ) ||
          ( shopperInfo.city == null || shopperInfo.city.trim() == '' ) ||
          ( shopperInfo.postalCode == null || shopperInfo.postalCode.trim() == '' ) ||
          ( shopperInfo.password == null || shopperInfo.password.trim() == '' ) ) {
            this.notify('Please fill out all necessary fields before proceeding.', '', this.LogLevel.ERROR, true);
            return;
          }

          if ( ! this.validations() ) {
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
          // Send Money
          this.balanceDAO.find(this.currentAccount.id).then(function(response) {
            var currentBalance = response;
            if ( shopperInfo.amount > currentBalance.balance ) {
              self.notify('Amount entered is more than current balance', '', self.LogLevel.ERROR, true);
              return;
            }
            if ( shopperInfo.amount == 0 || shopperInfo.amount == null ) {
              shopperInfo.amount = 0;
            }
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          });
        }

        if ( this.position == 2 ) {
          // Review

          var shopperPhone = shopperInfo.phoneNumber;

          var shopperAddress = this.Address.create({
            address1: shopperInfo.streetNumber + ' ' + shopperInfo.streetName,
            streetNumber: shopperInfo.streetNumber,
            streetName: shopperInfo.streetName,
            suite: shopperInfo.addressLine,
            city: shopperInfo.city,
            postalCode: shopperInfo.postalCode,
            regionId: shopperInfo.province
          });
          var newShopper = this.User.create({
            firstName: shopperInfo.firstName,
            lastName: shopperInfo.lastName,
            organization: 'N/A',
            businessName: 'N/A',
            email: shopperInfo.emailAddress,
            type: 'Personal',
            group: 'ccAdmin'==(this.group.id)?'ccShopper':'shopper',
            birthday: shopperInfo.birthday,
            phone: shopperPhone,
            address: shopperAddress,
            desiredPassword: shopperInfo.password,
            portalAdminCreated: true,
            profilePicture: shopperInfo.profilePicture,
            status: this.AccountStatus.ACTIVE,
            compliance: this.ComplianceStatus.PASSED
          });

          if ( newShopper.errors_ ) {
            this.notify(newShopper.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }
          if ( shopperAddress.errors_ ) {
            this.notify(shopperAddress.errors_[0][1], '', this.LogLevel.ERROR, true);
            return;
          }

          this.userDAO.put(newShopper).then(function(response) {
            shopperInfo.shopper = response;
          }).then(function() {
            if ( shopperInfo.amount > 0 ) {
              var transaction = self.Transaction.create({
                payeeId: shopperInfo.shopper.id,
                payerId: self.user.id,
                amount: shopperInfo.amount
              });
              return self.transactionDAO.put(transaction).then( function(response) {
                self.notify('New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + 'successfully added and value transfer sent.', '', self.LogLevel.INFO, true);
                self.subStack.push(self.views[self.subStack.pos + 1].view);
                self.nextLabel = 'Done';
              });
            } else {
              self.notify('New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + ' successfully added.', '', self.LogLevel.INFO, true);
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
