/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'CandlestickAlarm',

  documentation: `
    Generate an Alarm if a Candlestick exceeds some threshold between reporting intervals
  `,

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      documentation: 'Candlestick Key',
      class: 'Object',
      name: 'key'
    },
    {
      documentation: 'Candlestick property to test',
      class: 'String',
      name: 'propertyName',
      value: 'total'
    },
    {
      documentation: 'Alarm on percentage change since last test',
      class: 'Long',
      name: 'percentageChange',
      value: 10
    },
    {
      documentation: 'Optional',
      class: 'String',
      name: 'alarmName',
      javaFactory: 'return "ThresholdMonitor-"+getKey()+"-"+getPropertyName();'
    },
    {
      documentation: 'Optional',
      class: 'String',
      name: 'alarmNote'
    }
  ]
});
