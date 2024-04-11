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

foam.INTERFACE({
  package: 'foam.nanos.so',
  name: 'SystemOutageTask',

  javaImports: [
    'foam.core.X'
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

  methods: [
    {
      name: 'activate',
      args: 'X x'
    },
    {
      name: 'deactivate',
      args: 'X x'
    },
    {
      name: 'cleanUp',
      args: 'X x',
      documentation: 'work to be done when task is removed',
      javaCode: `
        deactivate(x);
      `
    }
  ]
});
