/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.util.date',
  name: 'TimeUnit',

  properties: [
    {
      class: 'String',
      name: 'shorthand'
    },
    {
      class: 'String',
      name: 'plural',
      factory: function() {
        return this.label + 's';
      }
    },
    {
      class: 'Long',
      name: 'conversionFactorMs'
    }
  ],

  values: [
    {
      name: 'YEAR',
      short: 'Y',
      conversionFactorMs: 31556926000
    },
    {
      name: 'MONTH',
      short: 'M',
      conversionFactorMs: 2629743833
    },
    {
      name: 'WEEK',
      short: 'W',
      conversionFactorMs: 604800000
    },
    {
      name: 'DAY',
      short: 'd',
      conversionFactorMs: 86400000
    },
    {
      name: 'HOUR',
      short: 'h',
      conversionFactorMs: 3600000
    },
    {
      name: 'MINUTE',
      short: 'm',
      conversionFactorMs: 60000
    },
    {
      name: 'SECOND',
      short: 's',
      conversionFactorMs: 1000
    },
    {
      name: 'MILLISECOND',
      short: 'ms',
      conversionFactorMs: 1
    }
  ]
});