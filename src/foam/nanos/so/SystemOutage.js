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
    'foam.nanos.logger.Loggers'
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
      visibility: 'RO'
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
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.so.SystemOutageTask',
      name: 'tasks',
      view: {
        class: 'foam.u2.view.FObjectArrayView',
        of: 'foam.nanos.so.SystemOutageTask',
        valueView: {
          class: 'foam.u2.view.FObjectView',
          of: 'foam.nanos.so.SystemOutageTask'
        }
      }
    }
  ],

  methods: [
    {
      name: 'activate',
      args: 'X x',
      type: 'Void',
      documentation: 'execute activate systemoutagetasks',
      javaCode: `
        for ( var task : getTasks() ) {
          try {
            task.activate(x);
          } catch ( RuntimeException e ) {
            Loggers.logger(x, this).error("Failed to activate System Outage: " + task.getClass().getSimpleName(), "error : " + e);
          }
        }
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      type: 'Void',
      documentation: 'execute activate systemoutagetasks',
      javaCode: `
        for ( var task : getTasks() ) {
          try {
            task.deactivate(x);
          } catch ( RuntimeException e ) {
            Loggers.logger(x, this).error("Failed to deactivate System Outage: " + task.getClass().getSimpleName(), "error : " + e);
          }
        }
      `
    }
  ]
});
