foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a merchant',

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
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
          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
          // Business Profile
          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 2 ) {
          // Review
          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 3 ) {
          // Send Money
          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.subStack.pos == this.views.length - 1 ) {
          // Done
          return this.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        }

      }
    }
  ]
});