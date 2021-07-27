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
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.fs.File'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        DAO fileDAO = (DAO) x.get("fileDAO");

        if ( ucj.getData() instanceof RenewableData ) {
          Document document = (Document) ucj.getData();
          String[] labels = document.getCapability().getLabels();
          File f = null;
          File f1 = null;
          for ( File file: document.getDocuments() ) {
            f = (File) fileDAO.find(file.getId());
            f1 = (File) f.fclone();
            f1.setLabels(labels);
            fileDAO.put(f1);
          }
        }
        return super.put_(x, obj);
      `
    }
  ]
})
