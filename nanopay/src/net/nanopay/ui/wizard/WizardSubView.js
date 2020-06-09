/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'hasBackOption',
    'hasOtherOption',
    'optionLabel'
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
