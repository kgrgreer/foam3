/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'DayChoiceView',
  extends: 'foam.u2.view.CardSelectView',

  css: `
  ^ {
    box-sizing: content-box;
    background-color: /*%WHITE%*/ #ffffff;
    border: solid 1px #b2b6bd;
    border-radius: 4px;
    padding: 8px 16px;
    transition: all 0.2s linear;
    text-align: center;
    width: 2.5em;
  }
  ^selected {
    background-color: /*%PRIMARY5%*/ #e5f1fc;
  }
  `,
  methods: [
    function render() {
      this
        .addClass()
        .enableClass(this.myClass('selected'), this.isSelected$)
        .enableClass(this.myClass('disabled'), this.isDisabled$)
        .enableClass(this.myClass('selected-disabled'), this.slot((isSelected, isDisabled) => {
          return isSelected  && isDisabled;
        }))
        .on('click', this.onClick)
        .add(this.label)
        .addClass('h600')
    }
  ]
});
