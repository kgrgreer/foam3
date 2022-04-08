/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FlexibleWizardContentsView',
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
      flex-direction: column;
      gap: 20pt;
    }
    ^flexButtons > * {
      flex-grow: 1;
      margin-left: 0 !important;
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
      const self = this;
      const current$ = this.slot(function (data, data$currentWizardlet, data$currentSection) {
        return data$currentSection.createView();
      })
      this.addClass()
        .add(current$)
        .add(this.slot(function (data$actionBar) {
          return this.E()
            .addClass(self.myClass('flexButtons'))
            .forEach(data$actionBar.reverse(), function (action) {
              this.tag(action, { size: 'LARGE' });
            });
        }))
        ;
    },
  ]
});
