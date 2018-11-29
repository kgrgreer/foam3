foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardSubView',
  extends: 'foam.u2.Controller',
  abstract: true,

  documentation: 'The default view that would be used for a view in the substack of the WizardView.',

  imports: [
    'backLabel',
    'onComplete',
    'complete',
    'errors',
    'exit',
    'exitLabel',
    'goBack',
    'goNext',
    'goTo',
    'isCustomNavigation',
    'nextLabel',
    'save',
    'saveLabel',
    'viewData',
    'wizard',
    'hasSaveOption',
    'hasNextOption',
    'hasExitOption',
    'hasBackOption'
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },
    function scrollToTop() {
      if ( ! this.wizard.el() ) return;

      this.wizard.el().scrollIntoView({ behavior: 'smooth', block: 'start' });
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
