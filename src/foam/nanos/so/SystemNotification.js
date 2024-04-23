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
  name: 'SystemNotification',

  javaImports: [
    'java.util.UUID'
  ],

  properties: [
    {
      documentation: 'set to the id of the encapsulating SystemOutage. Used to managed isDismissed in localStorage on the client.',
      class: 'String',
      name: 'id',
      factory: function() {
        return foam.uuid.randomGUID();
      },
      javaFactory: `
        return UUID.randomUUID().toString();
      `,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'message',
      createVisibility: 'RW',
      updateVisibility: function(dismissible) {
        return dismissible ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'WARN'
    },
    {
      documentation: 'Optionally restrict Notification to a particular menu, wizard, ... ',
      class: 'String',
      name: 'key'
    },
    {
      class: 'Boolean',
      name: 'dismissible',
      value: false
    },
    {
      name: 'dismissId',
      expression: function(key, id) {
        var val = this.cls_.name;
        if ( key ) val += "-" + key;
        val += "-" + id;
        return val;
      },
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'dismissed',
      expression: function(dismissId) {
        return dismissId && localStorage.getItem(dismissId);
      },
      transient: true,
      visibility: 'HIDDEN'
    }
  ]
});

