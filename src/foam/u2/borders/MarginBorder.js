/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'MarginBorder',
  extends: 'foam.u2.Element',

  documentation: 'A border which adds equal margin to all sides.',

  properties: [
    {
      name: 'margin',
      class: 'String',
      value: '24px'
    },
    {
      name: 'marginVertical',
      class: 'String',
      expression: function (margin) {
        return margin;
      }
    },
    {
      name: 'marginHorizontal',
      class: 'String',
      expression: function (margin) {
        return margin;
      }
    }
  ],

  methods: [
    function render() {
      this.style({'margin': this.slot(function (marginHorizontal, marginVertical) {
        return `${marginVertical} ${marginHorizontal}`;
      })});
    }
  ]
});
