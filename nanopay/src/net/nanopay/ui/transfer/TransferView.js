foam.CLASS({
  package: 'net.nanopay.ui.transfer',
  name: 'TransferView',
  extends: 'foam.u2.Controller',

  documentation: 'The default view that would be used for a view in the substack in the WizardView.',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext',
    'countdownView',
    'invoice',
    'invoiceMode',
    'user'
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
