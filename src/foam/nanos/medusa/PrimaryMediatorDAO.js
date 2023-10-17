/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PrimaryMediatorDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "put");
      MedusaEntry entry = (MedusaEntry) obj;
      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());

        if ( ! config.getIsPrimary() ) {
          Loggers.logger(x, this).error("received primary put", config.getId(), entry.getIndex());
          throw new MedusaException("Not primary");
        }

        MedusaEntrySupport entrySupport = (MedusaEntrySupport) x.get("medusaEntrySupport");
        // Acquire the real delegate dao for this nspec
        // TODO: cache mdao
        DAO dao = ((DAO) x.get(entry.getNSpecName()));
        DAO mdao = (DAO) dao.cmd_(x, foam.dao.DAO.LAST_CMD);

        if ( DOP.PUT == entry.getDop() ) {
          FObject nu = entry.getObject();
          FObject old = null;
          Object id = nu.getProperty("id");
          if ( id != null ) {
            old = mdao.find_(x, id);
          }
          nu = mdao.put_(x, nu);
          id = nu.getProperty("id");
          entry.setObjectId(id);

          String data = entrySupport.data(x, nu, old, entry.getDop());
          String transientData = entrySupport.transientData(x, nu, old, entry.getDop());
          entry.setData(data);
          entry.setTransientData(transientData);
          if ( SafetyUtil.isEmpty(data) &&
               SafetyUtil.isEmpty(transientData) ) {
            Loggers.logger(x, this).warning("No delta detected", entry.getObject().getClass().getName(), entry.getObjectId());
            MedusaEntry.OBJECT.clear(entry);
            return entry;
          }
        } else if ( DOP.REMOVE == entry.getDop() ) {
          FObject result = entry.getObject();
          Object id = obj.getProperty("id");
          entry.setObjectId(id);
          result = mdao.remove_(x, result);
          String data = entrySupport.data(x, result, null, entry.getDop());
          entry.setData(data);
        } else {
          throw new UnsupportedOperationException(entry.getDop().toString());
        }

        MedusaEntry.OBJECT.clear(entry);
        DaggerService dagger = (DaggerService) x.get("daggerService");
        entry = dagger.link(x, entry);
        entry = (MedusaEntry) getDelegate().put_(x, entry);
        return entry;
      } catch (Throwable t) {
        pm.error(x, entry.toSummary(), t);
        Loggers.logger(x, this).error("put", entry.toSummary(), t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    }
   ]
});
