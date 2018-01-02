foam.CLASS({
  package: 'net.nanopay.admin.ui.form.subscriber',
  name: 'AddSubscriberForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a subscriber',

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
        { parent: 'addSubscriber', id: 'form-addSubscriber-info',      label: 'User Info',        view: { class: 'net.nanopay.admin.ui.form.subscriber.AddSubscriberInfoForm' } },
        { parent: 'addSubscriber', id: 'form-addSubscriber-profile',   label: 'Business Profile', view: { class: 'net.nanopay.admin.ui.form.subscriber.AddSubscriberProfileForm' } },
        { parent: 'addSubscriber', id: 'form-addSubscriber-review',    label: 'Review',           view: { class: 'net.nanopay.admin.ui.form.subscriber.AddSubscriberReviewForm' } },
        { parent: 'addSubscriber', id: 'form-addSubscriber-done',      label: 'Done',             view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
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
        var subscriberInfo = this.viewData;

        if ( this.position == 0 ) { 
          // Merchant Info

          if ( ( subscriberInfo.firstName == null || subscriberInfo.firstName.trim() == '' ) ||
          ( subscriberInfo.lastName == null || subscriberInfo.lastName.trim() == '' ) ||
          ( subscriberInfo.phoneNumber == null || subscriberInfo.phoneNumber.trim() == '' ) ||
          ( subscriberInfo.password == null || subscriberInfo.password.trim() == '' ) ) {
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

          if ( ( subscriberInfo.businessName == null || subscriberInfo.businessName.trim() == '' ) ||
          ( subscriberInfo.companyEmail == null || subscriberInfo.companyEmail.trim() == '' ) ||
          ( subscriberInfo.registrationNumber == null || subscriberInfo.registrationNumber.trim() == '' ) ||
          ( subscriberInfo.streetNumber == null || subscriberInfo.streetNumber.trim() == '' ) ||
          ( subscriberInfo.streetName == null || subscriberInfo.streetName.trim() == '' ) ||
          ( subscriberInfo.city == null || subscriberInfo.city.trim() == '' ) ||
          ( subscriberInfo.postalCode == null || subscriberInfo.postalCode.trim() == '' ) ) {
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

          var businessPhone = this.Phone.create({
            number: subscriberInfo.phoneNumber
          });

          var businessAddress = this.Address.create({
            address1: subscriberInfo.streetNumber + ' ' + subscriberInfo.streetName,
            streetNumber: subscriberInfo.streetNumber,
            streetName: subscriberInfo.streetName,
            suite: subscriberInfo.addressLine,
            city: subscriberInfo.city,
            postalCode: subscriberInfo.postalCode,
            countryId: subscriberInfo.country,
            regionId: subscriberInfo.province
          });

          var newBusiness = this.User.create({
            firstName: subscriberInfo.firstName,
            lastName: subscriberInfo.lastName,
            organization: subscriberInfo.businessName,
            email: subscriberInfo.companyEmail,
            type: 'Business',
            group: 's2hCustomer',
            phone: businessPhone,
            address: businessAddress,
            password: subscriberInfo.password,
            businessIdentificationNumber: subscriberInfo.registrationNumber,
            website: subscriberInfo.website,
            businessTypeId: subscriberInfo.businessType,
            businessSectorId: subscriberInfo.businessSector
          });

          this.userDAO.put(newBusiness).then(function(response) {
            subscriberInfo.business = response;
            self.add(self.NotificationMessage.create({ message: 'New business ' + subscriberInfo.firstName + ' ' + subscriberInfo.lastName + ' successfully added!', type: '' }));
            self.subStack.push(self.views[self.subStack.pos + 1].view);
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