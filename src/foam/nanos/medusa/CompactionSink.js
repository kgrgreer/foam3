/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'CompactionSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'Find CompactionSink Facet for nspec dao of',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.SimpleFacetManager',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.HashMap',
    'java.util.Map'
  ],

  javaCode: `
    public CompactionSink(X x, Sink delegate) {
      super(x, delegate);
    }
    `
  ,

  properties: [
    {
      name: 'sinks',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
      getSink(getX(), obj).put(obj, sub);
      `
    },
    {
      name: 'getSink',
      args: 'X x, Object obj',
      type: 'foam.dao.Sink',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      Sink sink = (Sink) getSinks().get(entry.getNSpecName());
      if ( sink == null ) {
        Logger logger = Loggers.logger(x, this, "getSink");
        DAO dao = (DAO) x.get(entry.getNSpecName());
        if ( dao == null ) {
          logger.error("NSpec not found", entry.getNSpecName());
          getSinks().put(entry.getNSpecName(), getDelegate());
        } else {
          ClassInfo of = dao.getOf();
          String className = of.getId()+"CompactionSink";
          Map<String,Object> args = new HashMap();
          args.put("delegate", getDelegate());
          try {
            sink = (Sink) new SimpleFacetManager().create(className, args, x.put("logger", foam.nanos.logger.NullLogger.instance()));
            getSinks().put(entry.getNSpecName(), sink);
          } catch (Throwable t) {
            logger.debug("Unable to create", className, t.getMessage());
            getSinks().put(entry.getNSpecName(), getDelegate());
          }
        }
      }
      return (Sink) getSinks().get(entry.getNSpecName());
      `
    }
  ]
});
