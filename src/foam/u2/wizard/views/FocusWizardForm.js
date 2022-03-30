/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FocusWizardForm',
  extends: 'foam.u2.wizard.controllers.WizardForm',

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      margin: 40pt;
    }
    ^contents {
      flex-grow: 1;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'progressWizardView',
      value: {
        // class: 'foam.u2.borders.NullBorder'
        class: 'foam.u2.wizard.views.ProgressBarWizardView',
      }
    }
  ],

  methods: [
    function render() {
      this.addClass()
        .start(this.progressWizardView, { data: this })
          .addClass(this.myClass('progress'))
        .end()
        .start(this.view, { data: this })
          .addClass(this.myClass('contents'))
        .end()
        ;
    }
  ]
});
