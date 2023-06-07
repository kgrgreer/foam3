/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'DAOOMLogger',
  extends: 'foam.dao.ProxyDAO',
  description: 'OM DAO operations. By default, just put',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.boot.NSpecAware'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DOP',
    'foam.nanos.dao.Operation',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'set to true if storing multiple models in a single DAO and per model OMs are desired.',
      name: 'multiModelDAO',
      class: 'Boolean'
    },
    {
      name: 'omOnPut',
      class: 'Boolean',
      value: true
    },
    {
      name: 'omOnCreate',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnUpdate',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnFind',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnSelect',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnRemove',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnRemoveAll',
      class: 'Boolean',
      value: false
    },
    {
      name: 'omOnCmd',
      class: 'Boolean',
      value: false
    },
    {
      name: 'names',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      documentation: `Base implementation ignores passed object, but override for per obj OM names. Helpful if storing multiple models in a single dao`,
      name: 'getName',
      args: 'X x, String op, Object obj',
      type: 'String',
      javaCode: `
      Object entry = getNames().get(op);
      if ( getMultiModelDAO() && obj != null ) {
        if ( entry == null ) {
          entry = new HashMap();
          getNames().put(op, entry);
        }
        String name = (String) ((Map) entry).get(obj.getClass());
        if ( name == null ) {
           name = getNSpec().getName()+"."+obj.getClass().getSimpleName()+"."+op;
           ((Map) entry).put(obj.getClass(), name);
        }
        return name;
      } else if ( entry == null ) {
        String name = getNSpec().getName()+"."+op;
        getNames().put(op, name);
        return name;
      }
      return (String) entry;
      `
    },
    {
      name: 'put_',
      javaCode: `
    if ( getEnabled() && getOmOnCreate() || getEnabled() && getOmOnUpdate() ) {
      Object old = getDelegate().find_(x, obj);
      if ( getEnabled() && getOmOnCreate() && old == null ) {
        ((OMLogger) x.get("OMLogger")).log(getName(x, Operation.CREATE.getLabel(), obj));
      } else if ( getEnabled() && getOmOnUpdate() && old != null ) {
        ((OMLogger) x.get("OMLogger")).log(getName(x, Operation.UPDATE.getLabel(), obj));
      }
    }
    if ( getEnabled() && getOmOnPut() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.PUT.getLabel(), obj));
    return getDelegate().put_(x, obj);
     `
    },
    {
      name: 'find_',
      javaCode: `
      if ( getEnabled() && getOmOnFind() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.FIND.getLabel(), null));
      return getDelegate().find_(x, id);
     `
    },
    {
      name: 'select_',
      javaCode: `
      if ( getEnabled() && getOmOnSelect() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.SELECT.getLabel(), null));
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
     `
    },
    {
      name: 'remove_',
      javaCode: `
      if ( getEnabled() && getOmOnRemove() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.REMOVE.getLabel(), obj));
      return getDelegate().remove_(x, obj);
     `
    },
    {
      name: 'removeAll_',
      javaCode: `
      if ( getEnabled() && getOmOnRemoveAll() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.REMOVE_ALL.getLabel(), null));
      getDelegate().removeAll_(x, skip, limit, order, predicate);
     `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( getEnabled() && getOmOnCmd() ) ((OMLogger) x.get("OMLogger")).log(getName(x, DOP.CMD.getLabel(), null));
      return getDelegate().cmd_(x, obj);
     `
    }
  ]

});
