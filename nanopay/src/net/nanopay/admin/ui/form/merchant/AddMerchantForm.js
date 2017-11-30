foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a merchant',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'net.nanopay.ui.NotificationMessage',
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
        { parent: 'addMerchant', id: 'form-addMerchant-info',      label: 'Merchant Info',    view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantInfoForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-profile',   label: 'Business Profile', view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantProfileForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-review',    label: 'Review',           view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantReviewForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-sendMoney', label: 'Send Money',       view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantSendMoneyForm' } },
        { parent: 'addMerchant', id: 'form-addMerchant-done',      label: 'Done',             view: { class: 'net.nanopay.admin.ui.form.merchant.AddMerchantDoneForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function() { return true; },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position) {
        if( position <= this.views.length - 1 ) return true;
        return false;
      },
      code: function() {
        var self = this;

        // Info from form
        var merchantInfo = this.viewData;

        if ( this.position == 0 ) { 
          // Merchant Info

          if ( ( merchantInfo.firstName == null || merchantInfo.firstName.trim() == '' ) ||
          ( merchantInfo.lastName == null || merchantInfo.lastName.trim() == '' ) ||
          ( merchantInfo.phoneNumber == null || merchantInfo.phoneNumber.trim() == '' ) ||
          ( merchantInfo.password == null || merchantInfo.password.trim() == '' ) ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if( true ) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }

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
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if( true ) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }

        }

        if ( this.position == 2 ) {
          // Review

          var merchantPhone = this.Phone.create({
            number: merchantInfo.phoneNumber
          });

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
            email: merchantInfo.companyEmail,
            type: 'Merchant',
            phone: merchantPhone,
            address: merchantAddress,
            password: merchantInfo.password,
            businessIdentificationNumber: merchantInfo.registrationNumber,
            website: merchantInfo.website,
            businessType: merchantInfo.businessType,
            businessSector: merchantInfo.businessSector,
          });

          this.userDAO.put(newMerchant).then(function(response) {
            merchantInfo.merchant = response;
            self.add(self.NotificationMessage.create({ message: 'New merchant ' + merchantInfo.firstName + ' ' + merchantInfo.lastName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            return;
          });

        }

        if ( this.position == 3 ) {
          // Send Money

          if( true ) {
            if( merchantInfo.amount == 0 || merchantInfo.amount == null ) {
              self.add(self.NotificationMessage.create({ message: 'Please enter an amount greater than $0.00.', type: 'error' }));
              return;
            }

            var transaction = this.Transaction.create({
              payeeId: merchantInfo.merchant.id,
              payerId: this.user.id,
              amount: merchantInfo.amount
            });

            this.transactionDAO.put(transaction).then(function(response) {
              self.add(self.NotificationMessage.create({ message: 'Value transfer successfully sent.' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              return;
            }).catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
              return;
            });
          }
        }

        if ( this.subStack.pos == this.views.length - 1 ) {
          // Done
          return this.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        }

      }
    }
  ]
});