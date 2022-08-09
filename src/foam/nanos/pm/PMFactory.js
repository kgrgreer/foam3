/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMFactory',

  documentation: 'Context Factory for generating PMs or Null PMs.',

  javaImplements: [
    'foam.core.XFactory'
  ],

  javaImports: [
    'foam.core.*',
    'java.util.concurrent.ThreadLocalRandom'
  ],

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 100,
      help: '0 - never generate PMs, 100 - always generate PMs',
      view: {
        class: 'foam.u2.MultiView',
        views: [ {class: 'foam.u2.RangeView', minValue: 0, maxValue: 100}, 'foam.u2.IntView' ]
      }
    },
    {
      class: 'Boolean',
      name: 'enableLogging',
      documentation: 'If enabled, information is output to stderr to aid with tracing. Is copied to PM.'
    }
  ],

  methods: [
    {
      name: 'create',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Object',
      javaCode: `
        if ( getPercentage() != 100 ) {
          if ( ThreadLocalRandom.current().nextInt(0, 100) < getPercentage() ) {
            PM pm = new PM();
            pm.setEnableLogging(getEnableLogging());
            return pm;
          }

          return NULLPM__;
        }
        PM pm = new PM();
        pm.setEnableLogging(getEnableLogging());
        return pm;
      `
    }
  ],

  javaCode: `
    public final static PM NULLPM__ = new NullPM();
  `
});
