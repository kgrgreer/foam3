/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'AddWizardlet',
  // Conceptually AddWizardlet and EditWizardlet both extend an abstract,
  // but that's unnecessary since there are only two of these.
  extends: 'foam.u2.wizard.wizardflow.EditWizardlet',

  requires: [
    'foam.u2.wizard.agents.QuickAgent',
    'foam.u2.wizard.axiom.AlternateFlowAction',
    'foam.u2.wizard.wao.NullWAO',
    'foam.u2.wizard.wizardlet.BaseWizardlet',
    'foam.u2.wizard.wizardlet.WizardletSection'
  ],

  properties: [
    {
      class: 'String',
      name: 'wizardletId'
    },
    {
      class: 'String',
      name: 'before',
      documentation: `
        This is either empty or a wizardlet id.
        If it's not empty, the new wizardlet will be added before the
        specified wizardlet's location.
      `
    },
    {
      name: 'wizardlet_'
    }
  ],

  methods: [
    function spec (spec) {
      this.sequence.tag(this.QuickAgent, {
        executeFn: x => {
          const wizardlet = this.getWizardlet_();
          for ( const k in spec ) {
            wizardlet[k] = spec[k];
          }
        }
      });
      return this;
    },
    function getWizardlet_(x) {
      if ( this.wizardlet_ ) return this.wizardlet_;

      const newWizardlet = this.BaseWizardlet.create({}, x);
      newWizardlet.wao = this.NullWAO.create();
      newWizardlet.isAvailable = true;
      newWizardlet.isVisible = true;
      newWizardlet.id = this.wizardletId;
      newWizardlet.title = this.wizardletId;
      newWizardlet.sections = [
        this.WizardletSection.create({
              title: newWizardlet.title,
              isAvailable: true,
              customView: {
                class: 'foam.u2.Element'
              }
            }, x)
      ];

      if ( this.before ) {
        let i = x.wizardlets.findIndex(w => w.id == this.before);
        // TODO: report error using Analyticable
        if ( i == -1 ) throw new Error('missing wizardlet id: ' + this.before);

        x.wizardlets.splice(i, 0, newWizardlet);
      } else {
        x.wizardlets.push(newWizardlet);
      }

      return this.wizardlet_ = newWizardlet;
    }
  ]
})
