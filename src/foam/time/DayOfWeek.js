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
    { name: 'MONDAY',    label: 'Monday', shortName: 'Mon', ordinal: 1 },
    { name: 'TUESDAY',   label: 'Tuesday', shortName: 'Tue', ordinal: 2 },
    { name: 'WEDNESDAY', label: 'Wednesday', shortName: 'Wed', ordinal: 3 },
    { name: 'THURSDAY',  label: 'Thursday',  shortName: 'Thu', ordinal: 4 },
    { name: 'FRIDAY',    label: 'Friday',    shortName: 'Fri', ordinal: 5 },
    { name: 'SATURDAY',  label: 'Saturday',  shortName: 'Sat', ordinal: 6 },
    { name: 'SUNDAY',    label: 'Sunday',    shortName: 'Sun', ordinal: 7 }
  ]
});
