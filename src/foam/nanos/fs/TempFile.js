/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'TempFile',

  documentation: 'Represents a temporary file',

  mixins: [
    'foam.nanos.auth.CreatedAwareMixin'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'mimeType'
    },
    {
      class: 'Boolean',
      name: 'populated'
    },
    {
      class: 'Object',
      javaType: 'java.io.File',
      name: 'file_',
      javaFactory: `
        try {
          return java.io.File.createTempFile(getClassInfo().getId(), "");
        } catch ( java.io.IOException e ) {
          throw new RuntimeException(e);
        }
      `,
      flags: [ 'java' ]
    }
  ],

  methods: [
    {
      name: 'getOutputStream',
      type: 'java.io.OutputStream',
      javaCode: `
        try {
          return new java.io.FileOutputStream(this.getFile_());
        } catch ( java.io.FileNotFoundException e ) {
          return null;
        }
      `
    },
    {
      name: 'getInputStream',
      type: 'java.io.InputStream',
      javaCode: `
        try {
          return new java.io.FileInputStream(this.getFile_());
        } catch ( java.io.FileNotFoundException e ) {
          return null;
        }
      `
    }
  ]
});
