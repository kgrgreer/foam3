/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'DayOfMonthView',
  extends: 'foam.u2.view.MultiChoiceView',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'choiceView',
      value: { class: 'foam.u2.view.DateChoiceView' }
    },
    {
      name: 'maxSelected',
      value: 31
    },
    {
      name: 'showMinMaxHelper',
      value: false
    },
    {
      name: 'numberColumns',
      value: 7
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      var days = []
      for ( var i = 1; i <= 31; i++ )
        days.push(i);
      this.choices = days;
    }
  ]
});
