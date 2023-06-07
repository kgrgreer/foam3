/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.time',
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
      shorthand: 'Y',
      conversionFactorMs: 31556926000
    },
    {
      name: 'MONTH',
      shorthand: 'M',
      conversionFactorMs: 2629743833
    },
    {
      name: 'WEEK',
      shorthand: 'W',
      conversionFactorMs: 604800000
    },
    {
      name: 'DAY',
      shorthand: 'd',
      conversionFactorMs: 86400000
    },
    {
      name: 'HOUR',
      shorthand: 'h',
      conversionFactorMs: 3600000
    },
    {
      name: 'MINUTE',
      shorthand: 'm',
      conversionFactorMs: 60000
    },
    {
      name: 'SECOND',
      shorthand: 's',
      conversionFactorMs: 1000
    },
    {
      name: 'MILLISECOND',
      shorthand: 'ms',
      conversionFactorMs: 1
    }
  ]
});
