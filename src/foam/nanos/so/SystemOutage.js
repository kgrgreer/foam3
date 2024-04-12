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
  name: 'SystemOutage',

  mixins: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.util.Arrays',
    'java.util.List',
    'java.util.stream.Collectors'
  ],

  tableColumns: [
    'name',
    'enabled',
    'active',
    'startTime',
    'endTime'
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
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'DateTime',
      name: 'startTime'
    },
    {
      class: 'DateTime',
      name: 'endTime'
    }
  ],

  methods: [
    {
      name: 'activate',
      args: 'X x',
      documentation: 'execute Activate on all SystemOutageTasks',
      javaCode: `
        List<SystemOutageTask> tasks = (List) ((ArraySink) getTasks(x).select(new ArraySink())).getArray();
        for ( var task : tasks ) {
          try {
            task.activate(x);
          } catch ( RuntimeException e ) {
            Loggers.logger(x, this).error("Failed to activate System Outage: " + task.toSummary(), "error : " + e);
          }
        }
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      documentation: 'execute Deactivate on all SystemOutageTasks',
      javaCode: `
        List<SystemOutageTask> tasks = (List) ((ArraySink) getTasks(x).select(new ArraySink())).getArray();
        for ( var task : tasks ) {
          try {
            task.deactivate(x);
          } catch ( RuntimeException e ) {
            Loggers.logger(x, this).error("Failed to deactivate System Outage: " + task.toSummary(), "error : " + e);
          }
        }
      `
    },
    {

      javaType: 'SystemOutageTask[]',
      name: 'findNonOverlappingTasks',
      documentation: 'Returns a list of tasks whose tasks are in \'this\' but not in other',
      args: 'X x, SystemOutage other',
      javaCode: `
        List<String> otherTaskIds = ((List<SystemOutageTask>) ((ArraySink) other.getTasks(x).select(new ArraySink())).getArray())
          .stream()
          .map(t -> t.getId())
          .collect(Collectors.toList());

        return ((List<SystemOutageTask>) ((ArraySink) getTasks(x).select(new ArraySink())).getArray())
          .stream()
          .filter(t -> ! otherTaskIds.contains(t.getId()))
          .toArray(SystemOutageTask[]::new);
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() { return this.name; }
    }
  ]
});
