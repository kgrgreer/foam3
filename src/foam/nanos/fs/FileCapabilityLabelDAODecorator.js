/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileCapabilityLabelDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Decorator to add labels from capability to file',
  javaImports: [
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.crunch.document.Document',
    'foam.nanos.fs.File',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        DAO fileDAO = (DAO) x.get("fileDAO");
        if ( ucj.getData() instanceof Document ) {
          Document document = (Document) ucj.getData();
          String[] labels = document.getCapability().getLabels();
          for ( File file: document.getDocuments() ) {
            File f = (File) fileDAO.find(file.getId());
            f.setLabels(labels);
            f = (File) fileDAO.put(f);
          }
        }
        return super.put_(x, obj);
      `
    }
  ]
})
