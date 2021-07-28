/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'NullPM',
  extends: 'foam.nanos.pm.PM',

  documentation: 'A PM that does not log.',

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'init_',
      javaCode: ``
    },
    {
      name: 'log',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      javaCode: `
      if ( x == null ) return;
      if ( getIsError() ) return;
      if ( getEndTime() == 0L ) {
        setEndTime(System.currentTimeMillis());
      }
      PMLogger pmLogger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
      if ( pmLogger != null ) {
        pmLogger.log(this);
      }`
    }
  ]
});
