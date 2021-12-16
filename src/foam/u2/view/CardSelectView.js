/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CardSelectView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.borders.CardBorder'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  topics: [
    'clicked',
    'selectionDisabled'
  ],

  css: `
    ^innerFlexer {
      min-width: -webkit-fill-available;
    }

    ^ .foam-u2-borders-CardBorder {
      box-sizing: content-box;
      background-color: /*%WHITE%*/ #ffffff;
      border: solid 1px /*%GREY4%*/ #e7eaec;
      border-radius: 5px;
      min-height: 10vh;
      position: relative;
      padding: 16px;
      transition: all 0.2s linear;
    }
    ^selected {
      border-color: /*%PRIMARY3%*/ #406dea;
    }

    ^disabled {
      background-color: /*%GREY5%*/ #f5f7fa;
      color: /*%GREY2%*/ #9ba1a6;
    }

    ^selected-disabled {
      border-color: /*%PRIMARY5%*/ #b2c4f6;
      background-color: /*%GREY5%*/ #f5f7fa;
      color: /*%GREY2%*/ #9ba1a6;
    }
  `,

  documentation: `
    A selectable card which takes a boolean as data, has three stares: disabled, selected and unselected
  `,

  properties: [
    {
      class: 'String',
      name: 'label',
      factory: function() {
        return String(this.value);
      }
    },
    {
      class: 'Boolean',
      name: 'isSelected'
    },
    {
      class: 'Boolean',
      name: 'isDisabled',
      postSet: function(_, n) {
        if ( n ) this.selectionDisabled.pub();
      }
    }
  ],

  methods: [
    function render() {
      this
      .addClass(this.myClass())
      .addClass(this.myClass('innerFlexer'))
      .start(this.CardBorder)
        .enableClass(this.myClass('selected'), this.isSelected$)
        .enableClass(this.myClass('disabled'), this.isDisabled$)
        .enableClass(this.myClass('selected-disabled'), this.slot((isSelected, isDisabled) => {
          return isSelected  && isDisabled;
        }))
        .on('click', this.onClick)
        .add(this.label)
      .end();
    }
  ],

  listeners: [
    function onClick() {
      this.clicked.pub();
    }
  ]
});
