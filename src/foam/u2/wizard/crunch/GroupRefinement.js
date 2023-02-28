/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.crunch',
  name: 'GroupRefinement',
  refines: 'foam.nanos.crunch.Capability',

  properties: [
    {
      class: 'Object',
      name: 'wizardFlow',
      type: 'foam.lib.json.UnknownFObject',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      documentation: `
        WizardFlow to use for general admission wizard
      `,
      hidden: true,
      includeInDigest: false
    }
  ]
});
