/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.uid',
  name: 'FuidSearchService',

  implements: [
    'foam.util.uid.GlobalSearchService'
  ],

  imports: [
    'DAO fuidKeyDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'foam.util.UIDSupport',
    'java.util.HashMap',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'NUID_ID_PATTERN',
      type: 'Regex',
      value: /^\d*$/
    }
  ],

  methods: [
    {
      name: 'searchById',
      type: 'Map',
      args: [ 'Context x', 'String id' ],
      javaCode: `
        var result = new HashMap<String, String>();
        long nuid  = 0;
        if ( NUID_ID_PATTERN.matcher(id).matches() ) {
          try { nuid = Long.parseLong(id); }
          catch ( NumberFormatException e ) {
            // Ignored, cannot convert to long so it's not a nuid.
          }
        }

        try {
          if ( nuid > 0 ) {
            findById(x, nuid, getDaoList(UIDSupport.hash(nuid)), result);
          }
          findById(x, id, getDaoList(UIDSupport.hash(id)), result);
        } catch ( Exception e ) {
          Loggers.logger(x, this).warning("Failed to searchById", id, e);
        }
        return result;
      `
    },
    {
      name: 'findById',
      args: [ 'Context x', 'Object id', 'List daoList', 'Map result' ],
      javaCode: `
        if ( daoList != null ) {
          for ( var daoName : daoList ) {
            var dao = (DAO) x.get(daoName);
            if ( dao != null ) {
              var found = dao.inX(x).find(id);
              if ( found != null ) {
                result.put(daoName, found);
              }
            }
          }
        }
      `
    },
    {
      name: 'getDaoList',
      type: 'List',
      args: [ 'Integer key' ],
      javaCode: `
        return ((ArraySink) ((foam.mlang.sink.Map)
        getFuidKeyDAO()
          .where(EQ(FuidKey.KEY, key))
          .select(MAP(FuidKey.DAO_NAME, new ArraySink()))).getDelegate()).getArray();
      `
    }
  ]
});
