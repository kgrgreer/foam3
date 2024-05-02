/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  name: 'OrDAO',
  extends: 'foam.dao.ReadOnlyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ProxySink'
  ],

  requires: [
    'foam.dao.DedupSink',
  ],

  documentation: 'DAO composite which performs find() in second delegate if not found in first.',

  properties: [
    {
      name: 'primary',
      class: 'foam.dao.DAOProperty',
      help: 'This is the DAO to look things up in first.'
    }
  ],

  javaCode: `
  public OrDAO(DAO primary, DAO delegate) {
    setPrimary(primary);
    setDelegate(delegate);
  }
  `,

  methods: [
    {
      name: 'find_',
      code: function() {
        var self = this;
        return this.primary.find_(x, id).then(function(o) {
          return o || self.delegate.find_(x, id);
        });
      },
      javaCode: `
        FObject obj = getPrimary().find_(x, id);
        if ( obj != null ) return obj;
        return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      code: function() {
        var self = this;
        sink = sink || self.ArraySink.create();
        var ddSink = self.DedupSink.create({delegate: sink})
        return self.primary.select_(x, ddSink, skip, limit, order, predicate).then(function() {
          return self.delegate.select_(x, ddSink, skip, limit, order, predicate)
        }).then(function() {
          return sink;
        });
      },
      javaCode: `
        var dedup = (ProxySink) decorateDedupSink_(prepareSink(sink));
        getPrimary().select_(x, dedup, skip, limit, order, predicate);
        getDelegate().select_(x, dedup, skip, limit, order, predicate);
        return dedup.getDelegate();
      `
    }
  ]
});
