foam.CLASS({
  package: 'net.nanopay.ui.wizardView',
  name: 'WizardSubView',
  extends: 'foam.u2.Controller',

  documentation: 'The default view that would be used for a view in the substack of the WizardView.',

  imports: [
    'viewData',
    'errors',
    'backLabel',
    'nextLabel',
    'goBack',
    'goNext',
    'complete'
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
