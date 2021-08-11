/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.dao',
  name: 'QueryCachingDAODecorator',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Javascript DAO Decorator which adds select caching to a delegate DAO.',

  requires: [
    'foam.dao.PromisedDAO'
  ],

  properties: [
    {
      // The cache for local storage and fast access
      name: 'cache',
      factory: function() { return {}; }
    },
    {
      // Number of elements in the DAO backing this query cache
      // Allows limit to what we cache so we do not have to always call DAO if limit is not provided
      name: 'daoCount_',
      value: 0
    },
    {
      name: 'startIdx_'
    },
    {
      name: 'endIdx_'
    }
  ],

  methods: [
    // Put invalidates cache and is forwarded to the source.
    function put_(x, o) {
      //* Can caches be kept up to date efficiently? ****
      this.cache = {};
      this.clearProperty('daoCount_');
      return this.delegate.put_(x, o);
    },

    function select_(x, sink, skip, limit, order, predicate) {
      // Only handle query caching for ArraySink and Projection
      if ( ! (foam.dao.ArraySink.isInstance(sink) || foam.mlang.sink.Projection.isInstance(sink)) ) {
        return this.SUPER(x, sink, skip, limit, order, predicate);
      }

      var self = this;
      var key  = [sink, order, predicate].toString();

      return new Promise(function(resolve, reject) {

        // Validate we have a fresh dao count
        self.refreshDaoCount_(self).then(function() {

          // Ensure we have cache for request
          self.fillCache_(self, key, x, sink, skip, limit, order, predicate).then(function() {

            // Return data from cache
            for (let idx = self.startIdx_; idx < self.endIdx_; idx++) {
              sink.put(self.cache[key][idx]);
            }

            resolve(sink);
          });
        });
      });
    },

    function refreshDaoCount_(self) {
      // If we have not retrieved the dao count previously do it now
      if ( !self.hasOwnProperty('daoCount_') ) {
          return self.delegate.select_(foam.mlang.sink.Count.create()).then( function(count) {
            self.daoCount_ = count.array.length;
          });
      }

      return Promise.resolve();
    },

    function fillCache_(self, key, x, sink, skip, limit, order, predicate) {
      // Pre-check cache for elements
      self.startIdx_ = typeof skip !== 'undefined' ? skip : 0;
      self.endIdx_ = typeof limit !== 'undefined' && skip + limit < self.daoCount_ ? skip + limit : self.daoCount_;

      let startIdx = -1;
      let endIdx = -1;
      let hasMissingData = false;

      if (self.cache[key]) {
        // Cycle through exising cached elements to verify all requested are present
        for ( let idx = self.startIdx_; idx < self.endIdx_; idx++ ) {
          if (!self.cache[key][idx]) {
            if (!hasMissingData) {
              // Found start of missing data withing requested block
              hasMissingData = true;
              startIdx = idx;
            }

            // Make sure we have the last index of a missing data element within requested block
            endIdx = idx + 1;
          }
        }
      } else {
        // No data present load entire block
        hasMissingData = true;
        startIdx = self.startIdx_;
        endIdx = self.endIdx_;
        self.cache[key] = [];
      }

      if (hasMissingData) {
        return this.delegate.select_(x, sink, startIdx, 1 + endIdx - startIdx, order, predicate).then(function (result) {
          // Point to the appropriate array source
//          let array = foam.mlang.sink.Projection.isInstance(sink) ? result.projectionWithClass : result.array;

          // Update cache with missing data
          for (let idx = 0; idx < result.array.length; idx++) {
            if (!self.cache[key][startIdx + idx]) {
              self.cache[key][startIdx + idx] = result.array[idx];
            }
          }
        });
      }

      return Promise.resolve();
    },

    // Remove invalidates cache and is forwarded to the source.
    function remove_(x, o) {
      this.cache = {};
      this.clearProperty('daoCount_');
      return this.delegate.remove_(x, o);
    },

    // RemoveAll invalidates cache and is forwarded to the source.
    function removeAll_(x, skip, limit, order, predicate) {
      this.cache = {};
      this.clearProperty('daoCount_');
      this.delegate.removeAll_(x, skip, limit, order, predicate);
    }
  ]
});

