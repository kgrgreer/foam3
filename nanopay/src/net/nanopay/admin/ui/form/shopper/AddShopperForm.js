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
    'stack',
    'user',
    'email',
    'userDAO',
    'transactionDAO',
    'formatCurrency'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addShopper', id: 'form-addShopper-info',      label: 'Shopper Info', view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperInfoForm' } },
        { parent: 'addShopper', id: 'form-addShopper-review',    label: 'Review',       view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperReviewForm' } },
        { parent: 'addShopper', id: 'form-addShopper-sendMoney', label: 'Send Money',   view: { class: 'net.nanopay.admin.ui.form.shopper.AddShopperSendMoneyForm' } },
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

          if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(shopperInfo.phoneNumber) ) {
            this.add(self.NotificationMessage.create({ message: 'Phone number is invalid.', type: 'error' }));
            return; 
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
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
            password: shopperInfo.password
          });

          this.userDAO.put(newShopper).then(function(response) {
            shopperInfo.shopper = response;
            self.add(self.NotificationMessage.create({ message: 'New shopper ' + shopperInfo.firstName + ' ' + shopperInfo.lastName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            return;
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            return;
          });
        }

        if ( this.position == 2 ) {
          // Send Money

          if( shopperInfo.amount == 0 || shopperInfo.amount == null ) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.nextLabel = 'Done';
            return;
          } else {
            var transaction = this.Transaction.create({
              payeeId: shopperInfo.shopper.id,
              payerId: this.user.id,
              amount: shopperInfo.amount
            });

            this.transactionDAO.put(transaction).then(function(response) {
              var shopper = shopperInfo.shopper;
              var emailMessage = self.EmailMessage.create({
                to: [ shopper.email ]
              })

              return self.email.sendEmailFromTemplate(shopper, emailMessage, 'cc-template-invite/shopper', {
                name: shopper.firstName,
                email: shopper.email,
                money: self.formatCurrency(shopperInfo.amount/100),
              });
            })
            .then(function () {
              self.add(self.NotificationMessage.create({ message: 'Value transfer successfully sent.' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = 'Done';
            })
            .catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            });
            return;
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
