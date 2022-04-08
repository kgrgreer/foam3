/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.common',
  name: 'ReviewWizardletView',
  extends: 'foam.u2.View',
    
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.common.ReviewItem',
      name: 'items'
    }
  ],

  methods: [
    function render() {
      this.addClass()
        .start('h2').add('review view').end()
        .forEach(this.items, function (item) {
          // TODO
        })
        ;
    }
  ]
});
