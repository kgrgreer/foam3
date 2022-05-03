/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'PrerequisiteWAO',
  extends: 'foam.u2.wizard.wao.SplitWAO',
  flags: ['web'],

  documentation: `
  A WAO that loads from a direct (for now) prerequisite wizardlet's data
  `,

  properties: [
    foam.u2.wizard.data.PrerequisiteLoader
      .getOwnAxiomsByClass(foam.core.Property).map(a => a.clone()),
    {
      name: 'loader',
      factory: function () {
        const spec = {
          class: 'foam.u2.wizard.data.PrerequisiteLoader',
          delegate: { class: 'foam.u2.wizard.data.NullLoader' },
        }
        foam.u2.wizard.data.PrerequisiteLoader
          .getOwnAxiomsByClass(foam.core.Property)
          .forEach(a => {
            spec[a.name] = this[a.name]
          });
        return spec;
      }
    }
  ]
});
