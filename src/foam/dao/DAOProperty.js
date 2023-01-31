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
  package: 'foam.dao',
  name: 'DAOProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for storing a reference to a DAO.',

  requires: [ 'foam.dao.ProxyDAO' ],

  properties: [
    {
      name: 'view',
      value: { class: 'foam.comics.InlineBrowserView' }
    },
    {
      name: 'createVisibility',
      value: 'HIDDEN'
    },
    ['transient', true],
    ['of', 'foam.dao.DAO'],
    {
      name: 'javaInfoType',
      flags: ['java'],
      value: 'foam.core.AbstractDAOPropertyPropertyInfo'
    },
    {
      name: 'adapt',
      value: function(o, v, prop) {
        if ( ! v ) return;
        if ( foam.String.isInstance(v) && this.__subContext__ ) {
          // First, try to find in context
          let result = this.__subContext__[v];
          if ( result ) return result;

          // Second, treat like dotted path and follow path from context
          const path = v.split('.');
          result = this.__subContext__;

          for ( const part of path ) {
            // Return 'undefined' as soon as the path is broken
            if ( ! result[part] ) return;

            result = result[part];
          }

          return result;
        }
        if ( foam.Array.isInstance(v) && v.length ) {
          var dao = new foam.dao.MDAO.create({of: v[0].cls})

          v.forEach(i => dao.put(i));

          return dao;
        }
        return foam.core.FObjectProperty.ADAPT.value.call(this, o, v, prop);
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      var name = this.name;
      var prop = this;

      Object.defineProperty(proto, name + '$proxy', {
        get: function daoProxyGetter() {
          var proxy = prop.ProxyDAO.create({ delegate: this[name] }, this[name]);
          this[name + '$proxy'] = proxy;

          this.sub('propertyChange', name, function(_, __, ___, s) {
            proxy.delegate = s.get();
          });

          return proxy;
        },
        configurable: true
      });
    }
  ]
});
