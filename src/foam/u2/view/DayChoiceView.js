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
    background-color: $white;
    border: 1px solid $grey400;
    border-radius: 4px;
    padding: 8px 16px;
    transition: all 0.2s ease;
    width: 8ch;
  }
  ^:hover {
    cursor: pointer;
  }
  ^selected {
    background-color: $primary400;
    border-color: $primary400;
    color: $white;
    line-height: 1.5;
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
        .enableClass('h600', this.isSelected$);
    }
  ]
});
