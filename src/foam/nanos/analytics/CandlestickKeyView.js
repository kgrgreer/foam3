/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'CandlestickKeyView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of Candlesticks.',

  css: `
    ^ {
      background: $white;
      padding: 8px 16px;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }

    ^company {
      font-size: 1.2rem;
      color: #424242;
    }

    ^name {
      color: #999;
      font-size: 1rem;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.analytics.Candlestick',
      name: 'data',
      documentation: 'Set this to the Candlestick you want to display in this row.'
    }
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass(this.myClass('key'))
            .add(this.data.key)
          .end()
        .end();
    }
  ]
});
