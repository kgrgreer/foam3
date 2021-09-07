/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/


foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'TempFileDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'tempFileDAO decorator to perform remove operation',

  methods: [
    {
      name: 'remove_',
      documentation: 'TempFile stores actual file on fileSystem, so we need to explicitly remove it',
      javaCode: `
        ((TempFile) obj).getFile_().delete();

        return getDelegate().remove_(x, obj);
      `
    }
  ]
})
