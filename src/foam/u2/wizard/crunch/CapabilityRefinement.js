/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.crunch',
  name: 'CapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  properties: [
    {
      class: 'Object',
      name: 'wizardlet',
      type: 'foam.lib.json.UnknownFObject',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      documentation: `
        Defines a wizardlet to display this capability in a wizard. This
        wizardlet will display after this capability's prerequisites.
      `,
      hidden: true,
      factory: function() {
        return foam.nanos.crunch.ui.CapabilityWizardlet.create({}, this);
      },
      includeInDigest: false,
    },
    {
      class: 'Object',
      name: 'beforeWizardlet',
      type: 'foam.lib.json.UnknownFObject',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      hidden: true,
      documentation: `
        A wizardlet to display before this capability's prerequisites, and only
        if this capability is at the end of a prerequisite group returned by
        CrunchService's getCapabilityPath method.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      name: 'wizardConfig',
      type: 'foam.lib.json.UnknownFObject',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      view: { class: 'foam.u2.HTMLView' },
      documentation: `
        Configuration placed on top level capabilities defining various
        configuration options supported by client capability wizards.
      `,
      includeInDigest: false,
      factory: function() {
        return this.EasyCrunchWizard.create({}, this);
      },
      adapt: function(_, n) {
        if ( foam.lib.json.UnknownFObject.isInstance(n) && n.json ) {
          n = foam.lookup(n.json.class).create(n.json);
        }
        return n
      }
    },
  ]
});
