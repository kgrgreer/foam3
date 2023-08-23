/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.core.internal',
  name: 'InterfaceMethod',
  extends: 'foam.core.Method',

  documentation: 'An InterfaceMethod is a Method declaration, but lacks code.',

  properties: [
    {
      name: 'code',
      required: false
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: true
    }
  ],

  methods: [
    function installInProto() { },
    function installInClass(cls, superMethod, existingMethod) {
      // This is required to avoid inheritance from regular methods,
      // which would prevent methods from being named the same as methods
      // defined on FObject, like: log, warn, error.
      cls.axiomMap_[this.name] = this;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'InterfaceModel',
  extends: 'foam.core.Model',

  documentation: 'An Interface definition. Created with foam.INTERFACE().',

  properties: [
    [ 'extends', 'foam.core.AbstractInterface' ],
    {
      class: 'Boolean',
      name: 'proxy',
      label: 'Generate Proxy',
      help: 'If enabled, causes automatic proxy generation.'
    },
    {
      class: 'Boolean',
      name: 'client',
      label: 'Generate Client Stub',
      help: 'If enabled, causes automatic client generation.'
    },
    {
      class: 'Boolean',
      name: 'skeleton',
      label: 'Generate Server Skeleton',
      help: 'If enabled, causes automatic skeleton generation.'
    },
    {
      class: 'AxiomArray',
      name: 'methods',
      of: 'foam.core.internal.InterfaceMethod',
      adaptArrayElement: function(m) {
        return foam.core.internal.InterfaceMethod.create(foam.String.isInstance(m) ? {signature: m} : m);
      }
    },
    {
      class: 'StringArray',
      name: 'javaExtends'
    }
  ],

  methods: [
    function validate() {
      if ( this.extends !== 'foam.core.AbstractInterface' )
        throw 'INTERFACE: ' + this.id + ' does not extend AbstractInterface.  Did you mean impelments [ \'' + this.extends + '\' ], ?';
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'AbstractInterface',

  documentation: 'Abstract base-class for Interfaces.',

  axioms: [
    {
      installInClass: function(cls) {
        cls.create = function() {
          throw new Error("Cannot instantiate Interface: " + this.name);
        };
      }
    }
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function INTERFACE(m) {
      if ( m.refines ) {
        var i = foam.__context__.lookup(m.refines);

        if ( m.methods ) {
          var i2 = foam.core.InterfaceModel.create(m);
          for ( var m of i2.methods ) {
            var j = i.model_.methods.find(m2 => m2.name == m.name);
            if ( j == undefined ) {
              i.model_.methods.push(m);
            } else {
              i.model_.methods[j] = m;
            }
          }
        }
      } else {
        m.class = m.class || 'foam.core.InterfaceModel';
        foam.CLASS(m);

        if ( m.proxy ) {
          foam.CLASS({
            package:    m.package,
            name:       'Proxy' + m.name,
            implements: [ m.id ],
            flags:      m.flags,
            source:     m.source,
            properties: [
              {
                class: 'Proxy',
                of: m.id,
                name: 'delegate'
              }
            ]
          });
        }

        if ( m.client ) {
          foam.CLASS({
            package:    m.package,
            name:       'Client' + m.name,
            implements: [ m.id ],
            flags:      m.flags,
            source:     m.source,
            properties: [
              {
                class: 'Stub',
                of: m.id,
                name: 'delegate'
              }
            ]
          });
        }
      }
    }
  ]
});
