/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'LinkedFile',
  extends: 'foam.nanos.fs.File',

  documentation: 'Represents a file linked to object from the target DAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'Object',
      name: 'objId',
      hidden: true
    },
    {
      class: 'String',
      name: 'targetDaoKey',
      hidden: true
    }
  ],
  methods: [
    {
      type: 'java.io.InputStream',
      name: 'download',
      args: [ 'Context x' ],
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getTargetDaoKey()) ) {
          var dao = (DAO) x.get(getTargetDaoKey());
          if ( dao != null ) {
            var obj = dao.find_(x, getObjId());
            if ( obj instanceof DownloadAware ) {
              return ((DownloadAware) obj).download(x);
            }
          }
        }
        return null;
      `
    }
  ]
});
