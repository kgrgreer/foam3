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

    ^base {
      box-sizing: content-box;
      background-color: /*%WHITE%*/ #ffffff;
      border-radius: 5px;
      position: relative;
      padding: 16px;
      transition: all 0.2s linear;
      display: flex;
      align-items: center;
    }
    ^ .foam-u2-borders-CardBorder {
      min-height: auto;
    }
    .foam-u2-borders-CardBorder^large-card {
      min-height: 10vh;
    }
    ^ .foam-u2-borders-CardBorder^selected {
      border-color: /*%PRIMARY3%*/ #406dea;
    }

    ^ .foam-u2-borders-CardBorder^disabled {
      background-color: /*%GREY5%*/ #f5f7fa;
      color: /*%GREY2%*/ #9ba1a6;
    }

    ^ .foam-u2-borders-CardBorder^selected-disabled {
      border-color: /*%PRIMARY5%*/ #b2c4f6;
      background-color: /*%GREY5%*/ #f5f7fa;
      color: /*%GREY2%*/ #9ba1a6;
    }
  `,

  documentation: `
    A selectable card which takes a boolean as data, has three states: disabled, selected and unselected
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
    },
    'largeCard'
  ],

  methods: [
    function render() {
      this
      .addClass(this.myClass())
      .addClass(this.myClass('innerFlexer'))
      .start(this.CardBorder)
        .addClass(this.myClass('base'))
        .enableClass(this.myClass('large-card'), this.largeCard$)
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
