foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a shopper',

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.ui.NotificationMessage'
  ],

  imports: [
    'closeDialog',
    'stack'
  ],

  exports: [],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [],

  methods: [
    function init() {
      this.views = [
        { parent: 'addShopper', id: 'form-addShopper-info',      label: 'Shopper Info', view: { class: 'net.nanopay.admin.ui.form.AddShopperInfoForm' } },
        { parent: 'addShopper', id: 'form-addShopper-sendMoney', label: 'Send Money',   view: { class: 'net.nanopay.admin.ui.form.AddShopperSendMoneyForm' } },
        { parent: 'addShopper', id: 'form-addShopper-review',    label: 'Review',       view: { class: 'net.nanopay.admin.ui.form.AddShopperReviewForm' } },
        { parent: 'addShopper', id: 'form-addShopper-done',      label: 'Done',         view: { class: 'net.nanopay.admin.ui.form.AddShopperDoneForm' } }
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
        if ( this.position == 0 ) {
          var shopperInfo = this.viewData;
          // Add Shopper
        }

        if ( this.position == 1 ) {
          // Send Money
        }

        if ( this.position == 2 ) {
          // Review
        }

        if ( this.subStack.pos == this.views.length - 1 ) {
          this.closeDialog();
          return this.stack.push({ class: 'net.nanopay.admin.ui.UserView' });
        }
      }
    }
  ]




})