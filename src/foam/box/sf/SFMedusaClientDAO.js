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
  name: 'SFMedusaClientDAO',
  extends: 'foam.box.sf.SFDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport'
  ],

  properties: [
    {
      name: 'myConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'toConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "SFBroadcastReceiverDAO";
      `
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      transient: true,
      javaSetter: `
      if ( ! delegateIsSet_ ) {
        delegate_ = val;
        delegateIsSet_ = true;
      }
      `,
      javaGetter: ` 
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        DAO dao = support.getBroadcastClientDAO(getX(), getServiceName(), getMyConfig(), getToConfig());
        return dao;
      `
    }
  ],

  methods: [
    {
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);     
      `
    },
    {
      name: 'put_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);      
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
      `
    },
  ]
})