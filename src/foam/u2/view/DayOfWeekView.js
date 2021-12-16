foam.CLASS({
  package: 'foam.u2.view',
  name: 'DayOfWeekView',
  extends: 'foam.u2.view.MultiChoiceView',
  requires: [
    'foam.u2.view.DayChoiceView'
  ],
  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      value: { class: 'foam.u2.view.DayChoiceView' }
    },
    {
      name: 'maxSelected',
      value: 5
    },
    {
      name: 'showMinMaxHelper',
      value: false
    }
//    {
//      name: 'choices',
//      value: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri']
//    }
  ],
  methods: [
    function init() {
      this.choices = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri'];
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DayChoiceView',
  extends: 'foam.u2.view.CardSelectView',

  css: `
  ^ {
    box-sizing: content-box;
    background-color: #ffffff;
    border: solid 1px #b2b6bd;
    border-radius: 4px;
    padding: 8px 16px;
    transition: all 0.2s linear;
    text-align: center;
    width: 36px;
  }
  ^selected {
    background-color: #e5f1fc;
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
