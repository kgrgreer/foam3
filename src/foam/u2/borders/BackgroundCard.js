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
    }
  `,

  cssTokens: [
    {
      name: 'backgroundColor',
      value: function (e) {
        return e.LIGHTEN(
          e.TOKEN('someOtherToken'),
          20
        )
        return e.FScript("lighten(token('anotherName'), 20)")
        return e.LIGHTEN(e.COLOR('red'), 20);
      }
    }
  ],

  properties: [
    {
      class: 'Color',
      name: 'backgroundColor'
    }
  ],

  methods: [
    function init() {
      this.addClass().style({ 'background' : this.backgroundColor$ })
        .tag('', null, this.content$);
    }
  ]
});
