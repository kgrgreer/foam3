foam.CLASS({
  package: 'net.nanopay.admin.ui.form.business',
  name: 'AddBusinessForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a business',

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
        { parent: 'addBusiness', id: 'form-addBusiness-info',      label: 'User Info',        view: { class: 'net.nanopay.admin.ui.form.business.AddBusinessInfoForm' } },
        { parent: 'addBusiness', id: 'form-addBusiness-profile',   label: 'Business Profile', view: { class: 'net.nanopay.admin.ui.form.business.AddBusinessProfileForm' } },
        { parent: 'addBusiness', id: 'form-addBusiness-review',    label: 'Review',           view: { class: 'net.nanopay.admin.ui.form.business.AddBusinessReviewForm' } },
        { parent: 'addBusiness', id: 'form-addBusiness-done',      label: 'Done',             view: { class: 'net.nanopay.admin.ui.form.shared.AddUserDoneForm' } }
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
        var businessInfo = this.viewData;

        if ( this.position == 0 ) { 
          // Merchant Info

          if ( ( businessInfo.firstName == null || businessInfo.firstName.trim() == '' ) ||
          ( businessInfo.lastName == null || businessInfo.lastName.trim() == '' ) ||
          ( businessInfo.phoneNumber == null || businessInfo.phoneNumber.trim() == '' ) ||
          ( businessInfo.password == null || businessInfo.password.trim() == '' ) ) {
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

          if ( ( businessInfo.businessName == null || businessInfo.businessName.trim() == '' ) ||
          ( businessInfo.companyEmail == null || businessInfo.companyEmail.trim() == '' ) ||
          ( businessInfo.registrationNumber == null || businessInfo.registrationNumber.trim() == '' ) ||
          ( businessInfo.streetNumber == null || businessInfo.streetNumber.trim() == '' ) ||
          ( businessInfo.streetName == null || businessInfo.streetName.trim() == '' ) ||
          ( businessInfo.city == null || businessInfo.city.trim() == '' ) ||
          ( businessInfo.postalCode == null || businessInfo.postalCode.trim() == '' ) ) {
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
            number: businessInfo.phoneNumber
          });

          var businessAddress = this.Address.create({
            address1: businessInfo.streetNumber + ' ' + businessInfo.streetName,
            streetNumber: businessInfo.streetNumber,
            streetName: businessInfo.streetName,
            suite: businessInfo.addressLine,
            city: businessInfo.city,
            postalCode: businessInfo.postalCode,
            countryId: businessInfo.country,
            regionId: businessInfo.province
          });

          var newBusiness = this.User.create({
            firstName: businessInfo.firstName,
            lastName: businessInfo.lastName,
            organization: businessInfo.businessName,
            email: businessInfo.companyEmail,
            type: 'Business',
            phone: businessPhone,
            address: businessAddress,
            password: businessInfo.password,
            businessIdentificationNumber: businessInfo.registrationNumber,
            website: businessInfo.website,
            businessTypeId: businessInfo.businessType,
            businessSectorId: businessInfo.businessSector
          });

          this.userDAO.put(newBusiness).then(function(response) {
            businessInfo.business = response;
            self.add(self.NotificationMessage.create({ message: 'New business ' + businessInfo.firstName + ' ' + businessInfo.lastName + ' successfully added!', type: '' }));
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