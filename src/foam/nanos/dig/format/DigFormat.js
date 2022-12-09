/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.format',
  name: 'DigFormat',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'driverNSpec'
    },
    {
      class: 'Enum',
      name: 'format',
      of: 'foam.nanos.http.Format'
    }
  ]
});
