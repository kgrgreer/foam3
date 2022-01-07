/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
  ],
  
  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
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
      obj = getDelegate().put_(x, obj);
      broadcast(x, obj, DOP.PUT);
      return obj;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      obj = getDelegate().remove_(x, obj);
      broadcast(x, obj, DOP.REMOVE);
      return obj;
      `
    },
    {
      documentation: 'Broadcast to mediators',
      name: 'broadcast',
      args: 'Context x, FObject obj, DOP dop',
      javaCode: `
        //Find other mediators and send.

        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        
        if ( myConfig.getType() != MedusaType.MEDIATOR || myConfig.getStatus() != Status.ONLINE ) return;
        
        SFManager sfManager = (SFManager) x.get("SFManager");
        
        SFEntry entry = x.create(SFEntry.class);
        entry.setNSpecName(getNSpec().getName());
        entry.setDop(dop);
        entry.setObject(obj);

        for ( ClusterConfig config : support.getSfBroadcastMediators() ) {
          try {
            if ( config.getId().equals(myConfig.getId()) ) continue;
            DAO clientDAO = (DAO) sfManager.getSfs().get(config.getId());
            clientDAO.put(entry);
          } catch ( Throwable t ) {
            getLogger().info(config.getId(), t.getMessage());
          }
        }

        return;
      `
    }
  ]
});