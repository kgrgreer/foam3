/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaHealth',
  extends: 'foam.nanos.app.Health',
  javaGenerateDefaultConstructor: false,

  implements: [
    'foam.nanos.medusa.Clusterable'
  ],

  javaImports: [
    'foam.nanos.app.Health',
    'foam.nanos.app.HealthStatus'
  ],

  tableColumns: [
    'id',
    'version',
    'medusaType',
    'medusaStatus',
    'isPrimary',
    'index',
    'uptime',
    'next',
    'alarms'
  ],

  properties: [
    {
      name: 'clusterable',
      class: 'Boolean',
      value: false,
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      documentation: 'Type of a Medusa instance.',
      name: 'medusaType',
      shortName: 'mt',
      class: 'Enum',
      of: 'foam.nanos.medusa.MedusaType',
      visibility: 'RO'
    },
    {
      name: 'medusaStatus',
      shortName: 'ms',
      class: 'Enum',
      of: 'foam.nanos.medusa.Status',
      visibility: 'RO'
    },
    {
      documentation: 'True when this instance is the Primary.',
      name: 'isPrimary',
      shortName: 'mip',
      class: 'Boolean',
      visibility: 'RO'
    },
    {
      name: 'replaying',
      shortName: 'mr',
      class: 'Boolean',
      visibility: 'RO'
    },
    {
      name: 'index',
      shortName: 'mi',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'realm',
      shortName: 'mrm',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'region',
      shortName: 'mrn',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'zone',
      shortName: 'mz',
      class: 'Long',
      visibility: 'RO'
    }
  ],

  javaCode: `
  public MedusaHealth() {
    super();
  }

  public MedusaHealth(foam.core.X x) {
    super(x);

    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    if ( support == null ) return;

    ClusterConfig config = support.getConfig(x, support.getConfigId());
    setIsPrimary(config.getIsPrimary());
    setMedusaStatus(config.getStatus());
    setMedusaType(config.getType());
    setName(config.getName());
    // setPort(config.getPort());
    setRealm(config.getRealm());
    setRegion(config.getRegion());
    setZone(config.getZone());

    ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
    setReplaying(replaying.getReplaying());

    DaggerService dagger = (DaggerService) x.get("daggerService");
    setIndex(dagger.getGlobalIndex(x));

    // status
    if ( ! config.getEnabled() ) {
      setStatus(HealthStatus.DOWN);
      return;
    }

    boolean cluster = "true".equals(System.getProperty("CLUSTER", "false"));
    if ( config.getType() == MedusaType.MEDIATOR ) {
      ElectoralService electoral = (ElectoralService) x.get("electoralService");
      if ( config.getStatus() == Status.ONLINE &&
           config.getRegionStatus() == RegionStatus.ACTIVE &&
           ( config.getZone() > 0 ||
             ( config.getZone() == 0 &&
               electoral.getState() == ElectoralServiceState.IN_SESSION  &&
               cluster ) ) ) {
        setStatus(HealthStatus.UP);
      } else if ( config.getStatus() != Status.ONLINE &&
                  config.getRegionStatus() == RegionStatus.ACTIVE &&
                  config.getZone() == 0 &&
                  replaying != null ) {
        if ( ! foam.util.SafetyUtil.isEmpty(config.getErrorMessage()) ) {
          setErrorMessage(config.getErrorMessage());
          setStatus(HealthStatus.FAIL);
        } else {
          if ( config.getIsPrimary() ) {
            setStatus(HealthStatus.DRAIN);
          } else {
            setStatus(HealthStatus.MAINT);
          }
        }
      } else {
        setStatus(HealthStatus.MAINT);
      }
    } else if ( config.getStatus() == Status.ONLINE &&
                config.getRegionStatus() == RegionStatus.ACTIVE ) {
      setStatus(HealthStatus.UP);
    } else {
      setStatus(HealthStatus.MAINT);
    }
  }
  `
});
