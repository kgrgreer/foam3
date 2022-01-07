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
  name: 'SFBroadcastReceiverDAO',
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
    'foam.nanos.pm.PM',
    'foam.nanos.logger.Loggers'
  ],
  
  properties: [
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
        PM pm = PM.create(x, this.getClass().getSimpleName(), "put");
        SFEntry entry = (SFEntry) obj;

        Loggers.logger(x, this).error("put_", entry);
        
        try {
          DAO dao = ((DAO) x.get(entry.getNSpecName()));
          DAO mdao = (DAO) dao.cmd_(x, foam.dao.DAO.LAST_CMD);

          if ( DOP.PUT == entry.getDop() ) {
            FObject nu = entry.getObject();
            nu = mdao.put_(x, nu);
          } else {
            throw new UnsupportedOperationException(entry.getDop().toString());
          }

          return entry;
        } catch (Throwable t) {
          pm.error(x, entry, t);
          Loggers.logger(x, this).error("put", entry, t.getMessage(), t);
          throw t;
        } finally {
          pm.log(x);
        }
      `
    }
  ]
});