/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SaveAllAgent',
  flags: ['web'],
  documentation: `
    Currently used by CapableView to pre-save junctions for immediate
    invalidation of the model. This agent saves wizardlets in order.
  `,

  imports: [
    'notify',
    'rootCapability',
    'wizardlets'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  properties: [
    {
      class: 'Function',
      name: 'onSave'
    }
  ],

  methods: [
    async function execute() {
      let state = {
        allValid: true,
        topLevelUCJ: null
      };
      await this.save(state);
      if ( this.onSave ) {
        await this.onSave(state.allValid, state.topLevelUCJ);
      }
    },
    async function save(state, n) {
      if ( ! n ) n = 0;
      n += 1;

      try {
        for ( const w of this.wizardlets ) {
          if ( state.allValid ) state.allValid = w.isValid;
          var ucj = await w.save();
          if ( ucj && ucj.targetId == this.rootCapability.id ) state.topLevelUCJ = ucj;
        }
      } catch (e) {
        console.error(e);
        if ( n == 4 ) {
          this.notify(e.toString(), '', this.LogLevel.ERROR, true);
          return;
        }
        await new Promise(resolve => {
          setTimeout(async () => {
            await this.save(state, n);
            resolve();
          }, 5000);
        });
      }
    }
  ]
});
