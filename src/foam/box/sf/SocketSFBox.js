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
  name: 'SocketSFBox',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.box.Box' ],

  javaImports: [
    'foam.box.socket.*',
  ],
  
  properties: [
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'Int',
      name: 'port'
    }
  ],
  
  methods: [
    {
      name: 'send',
      javaCode: `
        SFEntry e = this.store((FObject) msg);
        this.forward(e);
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        msg.getAttributes().put("serviceKey", getServiceName());
        foam.box.Box box = ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).get(getX(), getHost(), getPort());
        box.send((Message) entry.getObject());
      `
    },
  ]
})