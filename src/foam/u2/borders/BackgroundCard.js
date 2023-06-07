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
      padding: 2.4rem;
      border-radius: 4px;
      overflow: auto;
    }
    ^.disablePadding {
      padding: 0;
    }
  `,

  properties: [
    {
      class: 'Color',
      name: 'backgroundColor'
    },
    {
      class: 'Boolean',
      name: 'padding',
      value: true
    }
  ],

  methods: [
    function init() {
      this.addClass()
        .enableClass('disablePadding', this.padding$.map(v => ! v))
        .style({ 'background' : this.backgroundColor$ })
        .tag('', null, this.content$);
    }
  ]
});
