/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.app',
  name: 'AppConfigService',

  skeleton: true,

  methods: [
    {
      name: 'getAppConfig',
      async: true,
      type: 'foam.nanos.app.AppConfig',
      args: 'Context x'
    }
  ]
});
