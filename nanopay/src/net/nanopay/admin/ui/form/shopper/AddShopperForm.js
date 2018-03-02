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
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'accountDAO',
    'email',
    'formatCurrency',
    'validateEmail',
    'validateAge',
    'validatePostalCode',
    'validatePhone',
    'stack',
    'transactionDAO',
    'user',
    'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
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

          if ( !this.validateEmail(shopperInfo.emailAddress) ){
            self.add(self.NotificationMessage.create({ message: 'Email address is invalid.', type: 'error' }));
            return;
          }

          if ( !this.validatePostalCode(shopperInfo.postalCode) ){
            self.add(self.NotificationMessage.create({ message: 'Postal code is invalid.', type: 'error' }));
            return;
          }

          if ( shopperInfo.password != shopperInfo.confirmPassword ){
            self.add(self.NotificationMessage.create({ message: "Confirmation password does not match.", type: 'error' }));
            return;
          }

          if ( !this.validatePhone(shopperInfo.phoneNumber) ) {
            this.add(self.NotificationMessage.create({ message: 'Phone number is invalid.', type: 'error' }));
            return;
          }

          if ( ! this.validateAge(shopperInfo.birthday) ) {
            this.add(self.NotificationMessage.create({ message: 'User should be at least 16 years of age to register.', type: 'error' }));
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
          // Send Money
          this.accountDAO.find(this.user.id).then(function(response){
            var account = response;
            if ( shopperInfo.amount > account.balance ){
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
            group: 'ccShopper',
            birthday: shopperInfo.birthday,
            phone: shopperPhone,
            address: shopperAddress,
            password: shopperInfo.password,
            portalAdminCreated: true,
            profilePicture: shopperInfo.profilePicture
          });

          this.userDAO.put(newShopper).then(function(response) {
            shopperInfo.shopper = response;
          }).then(function() {
            if( shopperInfo.amount > 0 ) {
              var transaction = self.Transaction.create({
                payeeId: shopperInfo.shopper.id,
                payerId: self.user.id,
                amount: shopperInfo.amount
              });
              return self.transactionDAO.put(transaction).then(function (response) {
                self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + 'successfully added and value transfer sent.' }));
                self.subStack.push(self.views[self.subStack.pos + 1].view);
                self.nextLabel = 'Done';
              });
            } else {
              self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + ' successfully added.' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = 'Done';
              return
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
