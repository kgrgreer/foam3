/**
  * @license
  * Copyright 2024 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.so.task',
  name: 'TaskInitRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Initialize system outage tasks',

  javaImports: [
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        SystemOutage so = (SystemOutage) obj;
        for ( SystemOutageTask task : so.getTasks() ) {
          if ( task.getId().isEmpty() ) {
            task.setId(UUID.randomUUID().toString());
          }

          if ( task.getSystemOutage().isEmpty() ) {
            task.setSystemOutage(so.getId());
          }
        }
      `
    }
  ]
})
