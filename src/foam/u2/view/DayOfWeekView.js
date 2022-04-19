/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'DayOfWeekView',
  extends: 'foam.u2.view.MultiChoiceView',

  requires: [
    'foam.time.DayOfWeek'
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
    },
    {
      name: 'numberColumns',
      value: 5
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.choices = this.DayOfWeek.VALUES;
    }
  ]
});
