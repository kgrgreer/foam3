/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RadioButton',
  extends: 'foam.u2.Element',

  documentation: 'A single radio button. Logic implemented in RadioView.js',

  imports: ['theme?'],

  css: `
  ^innerCircle.selected{
    r: 5px;
    fill: $primary400;
  }
  ^innerCircle{
    transition: 0.1s ease;
    transform-origin: center center;
    transform-box: stroke-box;
    r: 0px;
    fill: none;
  }
  ^outerCircle {
    stroke: $grey500;
  }
  ^outerCircle.selected {
    stroke: $primary400;
  }
  ^outerCircle.disabled {
    stroke: $grey200;
  }
  ^innerCircle.disabled {
    fill: $grey200;
  }
  `,

  properties: [
    [ 'nodeName', 'svg' ],
    {
      name: 'selectedColor',
      expression: function(isSelected, isDisabled) {
        if ( isDisabled ) {
          return this.theme ? this.theme.grey4 : '#E7EAEC';
        }
        if ( isSelected ) {
          // return this.theme ? this.theme.primary3 : '#406DEA';
          return foam.CSS.replaceTokens('$primary400', '', this.__subContext__);
        }
        return this.theme ? this.theme.grey2 : '#9BA1A6';
      }
    },
    {
      name: 'isDisabled',
      class: 'Boolean'
    },
    {
      name: 'isSelected',
      class: 'Boolean'
    }
  ],

  methods: [
    function render() {
      this
        .addClass('radio')
        .attrs({ width: 20, height: 20 })
        .start('circle')
          .addClass(this.myClass('outerCircle'))
          .enableClass('disabled', this.isDisabled$)
          .enableClass('selected', this.isSelected$)
          .attrs({ cx: 10, cy: 10, r: 8,/* 'stroke': this.selectedColor$, */ 'stroke-width': 2, 'transform-origin': '0 0', fill: 'none' })
        .end()
        .start('circle')
          .addClass(this.myClass('innerCircle'))
          .enableClass('selected', this.isSelected$)
          .enableClass('disabled', this.isDisabled$)
          .attrs({ cx: 10, cy: 10, r: 0/*, fill: this.selectedColor$ */ })
        .end();
    }
  ]
});
