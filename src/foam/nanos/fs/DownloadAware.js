/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.fs',
  name: 'DownloadAware',

  methods: [
    {
      name: 'download',
      javaType: 'java.io.InputStream',
      args: [ 'Context x' ]
    },
    {
      name: 'toFile',
      type: 'foam.nanos.fs.File',
      args: [ 'Context x' ]
    }
  ]
});
