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
    'upTime',
    'nextHeartbeatIn',
    'alarms',
    'bootTime'
  ],

  properties: [
    {
      documentation: 'Type of a Medusa instance.',
      name: 'medusaType',
      shortName: 'mmt',
      class: 'Enum',
      of: 'foam.nanos.medusa.MedusaType',
      value: 'OTHER',
      visibility: 'RO'
    },
    {
      name: 'medusaStatus',
      shortName: 'mms',
      class: 'Enum',
      of: 'foam.nanos.medusa.Status',
      value: 'OFFLINE',
      visibility: 'RO'
    },
    {
      documentation: 'True when this instance is the Primary.',
      name: 'isPrimary',
      label: 'Primary',
      shortName: 'mip',
      class: 'Boolean',
      value: false,
      visibility: 'RO'
    },
    {
      name: 'replaying',
      shortName: 'mr',
      class: 'Boolean',
      value: false,
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
    if ( support == null ) {
      setStatus(HealthStatus.DOWN);
      setMedusaStatus(Status.OFFLINE);
      return;
    }

    ClusterConfig config = support.getConfig(x, support.getConfigId());
    if ( ! config.getEnabled() ) {
      setStatus(HealthStatus.DOWN);
      setMedusaStatus(Status.OFFLINE);
      return;
    }

    setIsPrimary(config.getIsPrimary());
    setMedusaStatus(config.getStatus());
    setMedusaType(config.getType());
    setName(config.getName());
    setRealm(config.getRealm());
    setRegion(config.getRegion());
    setZone(config.getZone());

    ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
    setReplaying(replaying.getReplaying());
    if ( replaying.getReplaying() ) {
      setIndex(replaying.getIndex() * -1);
    } else {
      setIndex(replaying.getIndex());
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
