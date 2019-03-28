foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a shopper',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.NotificationMessage',
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
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( shopperInfo.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( ! this.validateEmail(shopperInfo.emailAddress) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePhone(shopperInfo.phoneNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAge(shopperInfo.birthday) ) {
        this.add(this.NotificationMessage.create({ message: 'User should be at least 16 years of age to register.', type: 'error' }));
        return;
      }
      if ( ! this.validateStreetNumber(shopperInfo.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAddress(shopperInfo.streetName) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
        return false;
      }
      if ( shopperInfo.addressLine.length > 0 && ! this.validateAddress(shopperInfo.addressLine) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
        return false;
      }
      if ( ! this.validateCity(shopperInfo.city) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePostalCode(shopperInfo.postalCode, 'CA') ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePassword(shopperInfo.password) ) {
        this.add(this.NotificationMessage.create({ message: 'Password must be at least 6 characters long.', type: 'error' }));
        return false;
      }
      if ( shopperInfo.password != shopperInfo.confirmPassword ) {
        this.add(this.NotificationMessage.create({ message: 'Confirmation password does not match.', type: 'error' }));
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
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
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
              self.add(self.NotificationMessage.create({ message: 'Amount entered is more than current balance', type: 'error' }));
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

          var shopperPhone = this.Phone.create({
            number: shopperInfo.phoneNumber
          });

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
            this.add(this.NotificationMessage.create({ message: newShopper.errors_[0][1], type: 'error' }));
            return;
          }
          if ( shopperPhone.errors_ ) {
            this.add(this.NotificationMessage.create({ message: shopperPhone.errors_[0][1], type: 'error' }));
            return;
          }
          if ( shopperAddress.errors_ ) {
            this.add(this.NotificationMessage.create({ message: shopperAddress.errors_[0][1], type: 'error' }));
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
                self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + 'successfully added and value transfer sent.' }));
                self.subStack.push(self.views[self.subStack.pos + 1].view);
                self.nextLabel = 'Done';
              });
            } else {
              self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + ' successfully added.' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = 'Done';
              return;
            }
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
