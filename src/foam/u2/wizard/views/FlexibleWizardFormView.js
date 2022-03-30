/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FlexibleWizardFormView',
  extends: 'foam.u2.View',

  issues: [
    'Add loading spinner support to ^'
  ],

  documentation: `
    This wizard view uses flex to center its contents.
  `,

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 40pt;
    }
    ^flexButtons {
      display: flex;
      gap: 20pt;
    }
    ^flexButtons > * {
      flex-grow: 1;
    }
  `,

  properties: [
    {
      name: 'onClose',
      class: ''
    }
  ],

  methods: [
    function render() {
      const current$ = this.slot(function (data, data$currentWizardlet, data$currentSection) {
        return data$currentSection.createView();
      })
      this.addClass()
        .add(current$)
        .start()
          .addClass(this.myClass('flexButtons'))
          .tag(this.data.GO_PREV, { size: 'LARGE' })
          .tag(this.data.GO_NEXT, { size: 'LARGE', buttonStyle: 'PRIMARY' })
        .end()
        ;
    },
  ]
});
