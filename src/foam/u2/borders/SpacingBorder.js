/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'SpacingBorder',
  extends: 'foam.u2.Element',
  documentation: 'A border which adds padding or margin.',

  imports: [
    'returnExpandedCSS'
  ],

  properties: [
    {
      class: 'String',
      name: 'padding',
      value: `1rem`
    },
    {
      class: 'String',
      name: 'margin'
    }
  ],

  methods: [
    function render() {
      this.style({
        'margin': this.margin$.map(this.returnExpandedCSS),
        'padding': this.padding$.map(this.returnExpandedCSS)
      });
    }
  ]
});
