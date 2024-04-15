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
  package: 'foam.nanos.so',
  name: 'SystemOutageTask',
  abstract: true,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.util.List'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'type',
      transient: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      factory: function() { return this.cls_.name; }
    }
  ],

  tableColumns: [
    'id',
    'type',
    'outage'
  ],

  methods: [
    {
      name: 'activate',
      args: 'X x',
      abstract: true,
      documentation: `
        Activate must always be called through a system outage.
        By doing so, it can be guaranteed that this task has been activated
        iff the calling system outage is active.
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      abstract: true
    },
    {
      name: 'cleanUp',
      args: 'X x',
      documentation: 'work to be done when task is removed',
      javaCode: `
        SystemOutage outage = findOutage(x);
        if ( outage != null && outage.getActive() ) {
          deactivate(x);
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() { return this.type + ' ' + this.id; }
    }
  ]
});
