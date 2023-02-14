/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CardBorder',
  extends: 'foam.u2.Element',

  cssTokens: [
    {
      name: 'borderSizeCardBorder',
      value: '4px'
    }
  ],

  css: `
    ^ {
      min-height: 60px;

      background-color: $white;
      border: solid $borderSizeCardBorder $grey300;
      border-radius: 5px;

      padding: 16px;

      transition: all 0.2s linear;
    }
  `,

  documentation: 'A stylized border. Intended for use when creating cards.',

  methods: [
    function render() {
      this.addClass();
    }
  ]
});
