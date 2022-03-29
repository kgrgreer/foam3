/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'ProgressBarWizardView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: auto;
    }
  `,

  properties: [
    [ 'nodeName', 'progress' ]
  ],

  methods: [
    function render() {
      this
        .addClass()
        .attr('max', this.data$.dot('data').dot('wizardlets').map(w => w ? w.length : 0))
        .attr('value', this.data$.dot('data').dot('wizardPosition').dot('wizardletIndex'))
        ;
    }
  ]
});