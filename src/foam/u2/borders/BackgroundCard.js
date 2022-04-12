/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'BackgroundCard',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 100%;
      padding: 24px;
      margin-top: 24px;
      margin-bottom: 32px;
      border-radius: 4px;
    }
  `,

  properties: [
    {
      class: 'Color',
      name: 'backgroundColor'
    }
  ],

  methods: [
    function init() {
      this.addClass().style({ 'background' : this.backgroundColor$ })
        .start('', null, this.content$).end();
    }
  ]
});
