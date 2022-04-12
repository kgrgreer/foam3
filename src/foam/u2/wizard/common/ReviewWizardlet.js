/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.common',
  name: 'ReviewWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  requires: [
    'foam.u2.wizard.WizardletSection',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.common.ReviewItem',
      name: 'items'
    },
    {
      name: 'sections',
      factory: function () {
        return [
          this.WizardletSection.create({
            isAvailable: true,
            title: 'Review',
            customView: {
              class: 'foam.u2.wizard.common.ReviewWizardletView',
              items$: this.items$
            }
          })
        ];
      }
    }
  ]
});
