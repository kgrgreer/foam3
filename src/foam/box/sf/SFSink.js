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
  name: 'SFSink',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.dao.Sink' ],
  
  javaImports: [
    'foam.dao.HTTPSink',
    'foam.core.FObject',
    'foam.dao.Sink'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'delegateNspecId',
    },
    {
      class: 'Proxy',
      of: 'foam.dao.Sink',
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
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      SFEntry e = this.store((FObject) obj);
      this.storeAndForward(e);
      
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        getDelegate().put(entry.getObject(), null);
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
        Sink sink = (Sink) getX().get(getDelegateNspecId());
        if ( sink == null ) throw new RuntimeException("NspecId: " + getDelegateNspecId() + "Not Found!!");
        setDelegate(sink);
      `
    },
    {
      name: 'remove',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new RuntimeException("HttpSFSink do not implement 'remove' method");
      `
    },
    {
      name: 'eof',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new RuntimeException("HttpSFSink do not implement 'remove' method");
      `    
    },
    {
      name: 'reset',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      throw new RuntimeException("HttpSFSink do not implement 'remove' method");
      `
    }
  ]
})  