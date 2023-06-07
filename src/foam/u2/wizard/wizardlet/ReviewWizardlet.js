/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'ReviewWizardlet',
  extends: 'foam.u2.wizard.wizardlet.BaseWizardlet',

  requires: [
    'foam.u2.detail.TabularSectionView',
    'foam.u2.wizard.wizardlet.WizardletSection',
  ],

  properties: [
    {
      class: 'String',
      name: 'actionLabel'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.ReviewItem',
      name: 'items'
    },
    {
      class: 'String',
      name: 'title',
      factory: function(){
        return 'Review Your Request';
      }
    },
    {
      class: 'Boolean',
      name: 'showTitles'
    },
    {
      name: 'sections',
      factory: function () {
        return [
          this.WizardletSection.create({
            isAvailable: true,
            title: 'Review',
            customView: {
              class: 'foam.u2.wizard.wizardlet.ReviewWizardletView',
              title$: this.title$,
              items$: this.items$,
              showTitle$: this.showTitles$
            }
          })
        ];
      }
    }
  ],

  methods: [
    function init() {
      const x = this.__subContext__;
      x.register(this.TabularSectionView, 'foam.u2.detail.SectionView');
    }
  ]
});
