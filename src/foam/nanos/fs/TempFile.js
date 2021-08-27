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
    }
  ],

  methods: [
    {
      name: 'getInputStream',
      type: 'java.io.InputStream',
      javaCode: `
        try {
          if ( file_ == null ) {
            file_ = java.io.File.createTempFile("tempFile", "");
          }
          return new java.io.FileInputStream(this.file_);
        } catch ( Exception e ) {
          return null;
        }
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private java.io.File file_;
        `);
      }
    }
  ]
});
