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
    },
    {
      class: 'Boolean',
      name: 'cloneOnPut',
      value: true
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(o, sub) {
        this.outputDAO.put(this.cloneOnPut ? o.clone() : o);
      },
      javaCode: `
      var fobj = (foam.core.FObject) obj;
      getOutputDAO().put(getCloneOnPut() ? fobj.fclone() : fobj);`
    }
  ]
});
