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
  name: 'SFBox',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.box.Box' ],

  javaImports: [
    'foam.core.FObject',
    'foam.box.Box',
    'foam.box.Message'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'nspecId',
    },
    {
      class: 'Proxy',
      of: 'foam.box.Box',
      name: 'delegate',
      transient: true,
      javaSetter: `
        if ( ! delegateIsSet_ ) {
          delegate_ = val;
          delegateIsSet_ = true;
        }
      `
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
      // SFEntry e = this.store((FObject) msg);
      // this.forward(e);
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        getDelegate().send((Message) entry.getObject());
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
        Box box = (Box) getX().get(getNspecId());
        if (  box == null ) throw new RuntimeException("NspecId: " + getNspecId() + "Not Found!!");
        setDelegate(box);
      `
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
          `
        }));
      }
    }
  ]
});