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
    {
      class: 'String',
      name: 'prerequisiteCapabilityId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      documentation: `
        OPTIONAL: For loading from the CapabilityJunction's data using a path
      `,
      name: 'loadFromPath'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      documentation: `
        OPTIONAL: For loading into the CapabilityJunction's data using a path
      `,
      name: 'loadIntoPath'
    },
    {
      class: 'Boolean',
      name: 'isWrappedInFObjectHolder'
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'cloneValue',
      value: true
    },
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
            const v = a.toJSON(this[a.name]);
            if ( v != null ) spec[a.name] = v;
          });
        return spec;
      }
    }
  ]
});
