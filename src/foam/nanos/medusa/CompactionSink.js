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
    'foam.core.ContextAware',
    'foam.core.X',
    'foam.core.FacetManager',
    'foam.dao.DAO',
    'foam.dao.AbstractSink',
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
  `,

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
      if ( sink != null ) return sink;

      Logger logger = Loggers.logger(x, this, "getSink");
      DAO dao = (DAO) x.get(entry.getNSpecName());
      if ( dao == null ) {
        if ( ! "bootstrap".equals(entry.getNSpecName()) ) {
          logger.error("NSpec not found", entry.getNSpecName());
        }
        getSinks().put(entry.getNSpecName(), getDelegate());
      } else {
        Compaction compaction = (Compaction) ((DAO) getX().get("compactionDAO")).find(entry.getNSpecName());
        if ( compaction != null ) {
          if ( ! compaction.getCompactible() ) {
            ((Logger) x.get("logger")).info("CompactionSink",entry.getNSpecName(), "sink,null");
            getSinks().put(entry.getNSpecName(), new AbstractSink());
          } else {
            getSinks().put(entry.getNSpecName(), getFacetedSink(x, entry));
          }
        } else {
          ((Logger) x.get("logger")).info("CompactionSink",entry.getNSpecName(), "sink,delegate");
          getSinks().put(entry.getNSpecName(), getDelegate());
        }
      }

      return (Sink) getSinks().get(entry.getNSpecName());
      `
    },
    {
      name: 'getFacetedSink',
      args: 'X x, MedusaEntry entry',
      type: 'Sink',
      javaCode: `
      DAO dao = (DAO) x.get(entry.getNSpecName());
      Compaction compaction = (Compaction) ((DAO) getX().get("compactionDAO")).find(entry.getNSpecName());

      Sink sink = (Sink) compaction.getSink();
      if ( sink == null ) {
        try {
          FacetManager fm = (FacetManager) x.get("facetManager");
          sink = (Sink) fm.create(dao.getOf().getId()+"CompactionSink", x);
        } catch (Throwable t) {
          // nop
        }
      }

      if ( sink != null ) {
        if ( sink instanceof ContextAware ) {
          ((ContextAware) sink).setX(x);
        }
        ((ProxySink) sink).setDelegate(getDelegate());
      } else {
        sink = getDelegate();
      }

      ((Logger) x.get("logger")).info("CompactionSink",entry.getNSpecName(), "sink",sink.getClass().getName());
      return sink;
      `
    }
  ]
});
