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

  documentation: `
    Inteface for SystemOutage Task.
    Note that persist method needs to be called after change to task to persist the change.
  `,

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
      order: -20,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.so.SystemOutage',
      name: 'systemOutage',
      order: -10,
      hidden: true
    }
  ],

  tableColumns: [
    'id',
    'type',
    'outage'
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

  methods: [
    {
      name: 'activate',
      args: 'X x',
      javaCode: `
        // nop
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      javaCode: `
        // nop
      `
    },
    {
      name: 'cleanUp',
      args: 'X x',
      documentation: 'work to be done when task is removed',
      javaCode: `
        deactivate(x);
      `
    },
    // {
    //   name: 'persist',
    //   args: 'X x',
    //   documentation: 'Need to put system outage on which this task is to persist change to the task',
    //   javaCode: `
    //     SystemOutage so = findOutage(x);
    //     List<SystemOutageTask> tasks = (List) ((ArraySink) so.getTasks(x).select(new ArraySink())).getArray();
    //     for ( SystemOutageTask task : tasks ) {
    //       if ( task.getId().equals(getId()) ) {
    //         SystemOutageTask t = (SystemOutageTask) this.fclone();
    //         t.copyFrom(task);
    //         ((DAO) x.get("systemOutageTaskDAO")).put(t);
    //       }
    //     }
    //     return;
    //   `
    // },
    {
      name: 'toSummary',
      type: 'String',
      code: function() { return this.type + ' ' + this.id; }
    }
  ]
});
