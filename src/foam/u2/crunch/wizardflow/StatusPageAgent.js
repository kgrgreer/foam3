/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'StatusPageAgent',

  imports: [
    'stack'
  ],

  exports: [
    'showStatusPage'
  ],

  requires: [
    'foam.u2.stack.StackBlock'
  ],

  methods: [
    async function execute() { },

    function showStatusPage(statusText, spinnerSize) {
      this.stack.push(this.StackBlock.create({
        view: {
          class: 'foam.u2.borders.StatusPageBorder',
          showBack: false,
          children: [
            {
              class: 'foam.u2.borders.SpacingBorder',
              children: [{
                class: 'foam.u2.LoadingSpinner',
                text: statusText,
                showText: true,
                size: spinnerSize || 'clamp(3.2rem, 50%, 10rem)'
              }],
              padding: '5rem 0'
            }
          ]
        },
        parent: this
      }));
    }
  ]
});
