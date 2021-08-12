/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dao',
  name: 'DAOCopySink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Puts all objects in the sink into a different DAO',

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Object',
      name: 'outputDAO',
      javaType: 'foam.dao.DAO',
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(o, sub) {
        this.outputDAO.put(o);
      },
      javaCode: 'getOutputDAO().put((foam.core.FObject) obj);'
    }
  ]
});
