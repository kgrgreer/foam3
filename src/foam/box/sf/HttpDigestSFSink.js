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

//TODO:
foam.CLASS({
  package: 'foam.box.sf',
  name: 'HttpDigestSFSink',
  extends: 'foam.box.sf.SF',
  implements: [ 'foam.dao.Sink' ],
  
  javaImports: [
    'foam.dao.HTTPSink',
    'foam.core.FObject'
  ],
  
  properties: [
    {
      class: 'URL',
      name: 'url',
    },
    {
      class: 'String',
      name: 'bearerToken',
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format',
      value: foam.nanos.http.Format.JSON
    },
    {
      class: 'Object',
      name: 'delegateObject',
      transient: true,
      javaFactory: `
      return new HTTPSink(
        getUrl(),
        getBearerToken(),
        getFormat(),
        new foam.lib.AndPropertyPredicate(
          getX(),
          new foam.lib.PropertyPredicate[] {
            new foam.lib.ExternalPropertyPredicate(),
            new foam.lib.NetworkPropertyPredicate(),
            new foam.lib.PermissionedPropertyPredicate()
          }
          ),
          true
          );
          `
        },
      ],
      
      methods: [
        {
          name: 'put',
          code: function() {},
          swiftCode: '// NOOP',
          javaCode: `
          SFEntry e = this.store((FObject) obj);
          this.forward(e);
          
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