/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.time',
  name: 'MonthOfYear',

  documentation: 'Represents months of year',

  properties: [
    {
      class: 'String',
      name: 'shortName'
    }
  ],

  values: [
    { name: 'JANUARY',    label: 'January', shortName: 'Jan', ordinal: 1 },
    { name: 'FEBRUARY',   label: 'February', shortName: 'Feb', ordinal: 2 },
    { name: 'MARCH',      label: 'March',   shortName: 'Mar', ordinal: 3 },
    { name: 'APRIL',      label: 'April',   shortName: 'Apr', ordinal: 4 },
    { name: 'MAY',        label: 'May',     shortName: 'May', ordinal: 5 },
    { name: 'JUNE',       label: 'June',     shortName: 'Jun', ordinal: 6 },
    { name: 'JULY',       label: 'July',    shortName: 'Jul', ordinal: 7 },
    { name: 'AUGUST',     label: 'August',  shortName: 'Aug', ordinal: 8 },
    { name: 'SEPTEMBER',  label: 'September', shortName: 'Sep', ordinal: 9 },
    { name: 'OCTOBER',    label: 'October', shortName: 'Oct', ordinal: 10 },
    { name: 'NOVEMBER',   label: 'November', shortName: 'Nov', ordinal: 11 },
    { name: 'DECEMBER',   label: 'December', shortName: 'Dec', ordinal: 12 }
  ]
});
