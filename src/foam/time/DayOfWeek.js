/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.time',
  name: 'DayOfWeek',

  documentation: 'Represents day of the week',

  properties: [
    {
      class: 'String',
      name: 'shortName'
    }
  ],

  values: [
    { name: 'MONDAY',    label: 'Monday',    shortName: 'Mon' },
    { name: 'TUESDAY',   label: 'Tuesday',   shortName: 'Tue' },
    { name: 'WEDNESDAY', label: 'Wednesday', shortName: 'Wed' },
    { name: 'THURSDAY',  label: 'Thursday',  shortName: 'Thu' },
    { name: 'FRIDAY',    label: 'Friday',    shortName: 'Fri' },
    { name: 'SATURDAY',  label: 'Saturday',  shortName: 'Sat' },
    { name: 'SUNDAY',    label: 'Sunday',    shortName: 'Sun' }
  ]
});
