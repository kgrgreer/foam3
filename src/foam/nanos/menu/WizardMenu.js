/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.menu',
  name: 'WizardMenu',
  extends: 'foam.nanos.menu.AbstractMenu',
  
  requires: [
    'foam.util.async.Sequence',
    'foam.u2.crunch.WizardRunner',
    'foam.u2.crunch.EasyCrunchWizard'
  ],
  
  properties: [
    {
      name: 'source',
      adapt: function(o, n) {
        if ( ! foam.Object.isInstance(n) ) return n
        return foam.json.parse(n)
      }
    },
    {
      class: 'Object',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      name: 'config',
      type: 'foam.lib.json.UnknownFObject',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectParser()',
      includeInDigest: false,
      factory: function() {
        return {
          class: 'foam.u2.crunch.EasyCrunchWizard'
        } 
      }
    }
  ],
  
  methods: [
    async function launch(x, menu) {
      const runner = this.WizardRunner.create({
        source: this.source
      }, x)

      runner.sequence.addBefore('ConfigureFlowAgent', this.config)
      runner.launch()
    }
  ]
});