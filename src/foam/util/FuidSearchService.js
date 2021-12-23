/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'FuidSearchService',
  javaExtends: 'foam.core.ContextAwareSupport',

  implements: [
    'foam.nanos.NanoService',
    'foam.util.GlobalSearchService'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Loggers',
    'foam.util.UIDSupport',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  constants: [
    {
      name: 'NUID_ID_PATTERN',
      type: 'Regex',
      value: /^\d*$/
    }
  ],

  javaCode: `
    private final Map<Integer, List> hashes_ = new HashMap<>();
  `,

  methods: [
    {
      name: 'start',
      javaCode: `
        var nSpecDAO = (DAO) getX().get("nSpecDAO");
        var sink = new AbstractSink(getX()) {
          @Override
          public void put(Object obj, Detachable sub) {
            var nspec = (NSpec) obj;
            var key   = nspec.getUidKey();
            if ( key > -1 ) {
              var serviceList = hashes_.get(key);
              if ( serviceList == null ) {
                serviceList = new ArrayList();
                hashes_.put(key, serviceList);
              }

              var serviceName = nspec.getName();
              if ( ! serviceList.contains(serviceName) ) {
                serviceList.add(serviceName);
              }
            }
          }
        };
        nSpecDAO.select(sink);
        nSpecDAO.listen(sink, null);
      `
    },
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
      javaCode: 'return hashes_.get(key);'
    }
  ]
});
