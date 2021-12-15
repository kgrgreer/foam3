/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmIdRefines',
  refines: 'foam.nanos.alarming.AlarmId',

  javaCode: `
    public AlarmId(String name) {
      this(name, System.getProperty("hostname", "localhost"));
    }
  `
});
