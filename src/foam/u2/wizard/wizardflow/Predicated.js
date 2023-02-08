/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'Predicated',
  extends: 'foam.util.async.SequenceInstaller',
  implements: [
    'foam.core.ContextAgent',
  ],
  mixins: [
    'foam.u2.wizard.wizardflow.WizardDSL',
    'foam.u2.wizard.wizardflow.SubDSL'
  ],

  requires: [
    'foam.u2.wizard.agents.QuickAgent',
    'foam.u2.wizard.axiom.AlternateFlowAction',
    'foam.util.async.SequenceInstaller'
  ],

  properties: [
    {
      class: 'Function',
      name: 'cond'
    }
  ],

  methods: [
    async function execute (x) {
      x = x || this.__context__;
      const SUPER = this.SUPER.bind(this);
      if ( ! await this.cond(x) ) return x;
      return await SUPER(x);
    },
    function end () {
      const args = foam.json.objectify(this);
      delete args.class;
      this.parent.tag(this.cls_, args);
      return this.parent;
    }
  ]
})
