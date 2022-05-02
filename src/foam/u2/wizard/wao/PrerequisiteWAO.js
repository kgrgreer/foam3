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
    ...(k => foam.USED[k] || foam.UNUSED[k])('foam.u2.wizard.data.PrerequisiteLoader').properties,
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
            // We use toJSON here because some property values, such as those
            // of Class properties, are recursive and therefore invalid inside
            // FObjectSpec property values (of which spec is one)
            spec[a.name] = a.toJSON(this[a.name]);
          });
        return spec;
      }
    }
  ]
});
