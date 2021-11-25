/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Entry point into the Medusa system.
This DAO intercepts MDAO 'put' operations and creates a medusa entry for
argument model.  It then marshalls it to the primary mediator,
and waits on a response.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.RemoveSink',
    'foam.lib.json.JSONParser',
    'foam.log.LogLevel',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'medusaEntryDAO',
      class: 'String',
      value: 'medusaEntryMediatorDAO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          getNSpec().getName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      return update(x, obj, DOP.PUT);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return update(x, obj, DOP.REMOVE);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      documentation: 'Route DAO operation to primary mediator',
      name: 'update',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      javaType: 'foam.core.FObject',
      javaCode: `
      if ( ! ( DOP.PUT == dop ||
               DOP.REMOVE == dop ) ) {
        getLogger().warning("update", "Unsupported operation", dop.getLabel());
        throw new UnsupportedOperationException(dop.getLabel());
      }
      if ( obj instanceof Clusterable &&
           ! ((Clusterable) obj).getClusterable() ) {
        if ( DOP.PUT == dop ) return getDelegate().put_(x, obj);
        if ( DOP.REMOVE == dop ) return getDelegate().remove_(x, obj);
      }

      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      if ( replaying.getReplaying() ) {
        // NOTE: On restart of mediators, preexisting admin logins will
        // be reset and attempt to load the login view triggering
        // a session update from SessionServerBox. The session dao
        // is clustered and the put arrives here to be clustered.
        // During replay the operation can not be supported.
        throw new MedusaException("Replaying");
      }

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());

      MedusaEntrySupport entrySupport = (MedusaEntrySupport) x.get("medusaEntrySupport");
      MedusaRegistry registry = (MedusaRegistry) x.get("medusaRegistry");

      PM pm = PM.create(x, this.getClass().getSimpleName(), "update");
      try {
        if ( DOP.PUT == dop ) {
          FObject nu = obj;
          FObject old = null;
          Object id = obj.getProperty("id");
          if ( id != null ) {
            old = getDelegate().find_(x, id);
          }
          String data = entrySupport.data(x, nu, old, dop);
          String transientData = entrySupport.transientData(x, nu, old, dop);
          if ( SafetyUtil.isEmpty(data) &&
               SafetyUtil.isEmpty(transientData) ) {
            // No delta.
            // getLogger().debug("update", dop, nu.getClass().getSimpleName(), id, "no delta", "return");
            return nu;
          }

          MedusaEntry entry = x.create(MedusaEntry.class);
          entry.setNSpecName(getNSpec().getName());
          entry.setDop(dop);
          entry.setObject(obj);
          entry.setObjectId(id);
          entry = (MedusaEntry) ((DAO) x.get(getMedusaEntryDAO())).put_(getX(), entry);
          PM pmWait = PM.create(x, this.getClass().getSimpleName(), "wait");
          registry.wait(x, (Long) entry.getId());
          pmWait.log(x);

          id = entry.getObjectId();
          nu = getDelegate().find_(x, id);

          if ( nu == null ) {
            getLogger().error("update", dop, entry.toSummary(), "find", id, "null");
            Alarm alarm = new Alarm();
            alarm.setClusterable(false);
            alarm.setSeverity(LogLevel.ERROR);
            alarm.setName("MedusaAdapter failed to update");
            alarm.setNote(obj.getClass().getName()+" "+id);
            alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
            throw new MedusaException("Failed to update");
          }
          return nu;
        } else { // if ( DOP.REMOVE == dop ) {
          FObject result = obj;
          Object id = obj.getProperty("id");
          MedusaEntry entry = x.create(MedusaEntry.class);
          entry.setNSpecName(getNSpec().getName());
          entry.setDop(dop);
          entry.setObject(obj);
          entry.setObjectId(id);
          entry = (MedusaEntry) ((DAO) x.get(getMedusaEntryDAO())).put_(getX(), entry);
          registry.wait(x, (Long) entry.getId());

          if ( getDelegate().find_(x, id) != null ) {
            getLogger().error("update", dop, entry.toSummary(), "remove", id, "not deleted");
            Alarm alarm = new Alarm();
            alarm.setClusterable(false);
            alarm.setSeverity(LogLevel.ERROR);
            alarm.setName("MedusaAdapter failed to remove");
            alarm.setNote(obj.getClass().getName()+" "+id);
            alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
            throw new MedusaException("Failed to delete");
          }
          return result;
        }
     } catch (MedusaException e) {
        pm.error(x, e);
        throw e;
     } catch (Throwable t) {
        pm.error(x, t);
        getLogger().error("put", t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
    `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( foam.dao.DAO.LAST_CMD.equals(obj) ) {
        return getDelegate();
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
