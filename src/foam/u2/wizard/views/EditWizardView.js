/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'EditWizardView',
  extends: 'foam.u2.View',
  documentation: `
    A WizardView for update actions.

    This wizard view displays a border around each wizardlet with update
    actions. If the wizardlet comes from a capability, the capability's
    configured edit behaviour will be used to determine what border
    a wizardlet is rendered in.
  `,

  requires: [
    'foam.u2.borders.Block'
  ],

  methods: [
    function render () {
      this
        .react(function (data$wizardlets) {
          this.forEach(data$wizardlets, function (wizardlet) {
            const border = this.getBorder_(wizardlet);
            this
              .start(border)
                .forEach(wizardlet.sections, function (section) {
                  this.add(section.createView() ?? this.E());
                })
              .end()
          });
        });
    },

    function getBorder_(wizardlet) {
      if ( ! wizardlet.capability ) return this.Block;
      return this.Block;
    }
  ]
});
