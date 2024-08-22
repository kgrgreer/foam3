/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DedupSink',
  extends: 'foam.dao.ProxySink',

  properties: [
    {
      class: 'Object',
      /** @private */
      name: 'results',
      javaType: 'java.util.HashSet',
      hidden: true,
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      /** If the object to be put() has already been seen by this sink,
        ignore it */
      name: 'put',
      code: function put(obj, sub) {
        if ( ! this.results[obj.id] ) {
          this.results[obj.id] = true;
          return this.delegate.put(obj, sub);
        }
      },
      javaCode: `if ( getResults() == null ) setResults(new java.util.HashSet<>());
            if ( ! getResults().contains(((foam.core.FObject)obj).getProperty("id")) ) {
              getDelegate().put(obj, sub);
              getResults().add(((foam.core.FObject)obj).getProperty("id"));
            }`
    }
  ]
});
