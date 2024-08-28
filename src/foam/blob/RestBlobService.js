/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'RestBlobService',
  extends: 'foam.blob.AbstractBlobService',

  flags: [],

  documentation: 'Implementation of a BlobService against a REST interface.',

  requires: [
    'foam.net.HTTPRequest',
    'foam.blob.BlobBlob',
    'foam.blob.IdentifiedBlob'
  ],

  imports: [
    'sessionID'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'String',
      name: 'address',
      factory: function() {
        return window.location.origin + '/' + this.serviceName;
      }
    }
  ],

  methods: [
    function put_(x, blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        // Already stored.
        return Promise.resolve(blob);
      }

      var url = this.address;
      var sessionId = this.sessionID || localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(url);
      req.method = 'PUT';
      req.payload = blob;

      var self = this;

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        return foam.json.Parser.create({ creationContext: self.__context__ }).parseString(payload);
      });
    },

    function urlFor_(x, blob) {
      if ( ! foam.blob.IdentifiedBlob.isInstance(blob) ) {
        return null;
      }

      var url = this.address + '/' + blob.id;
      var sessionId = localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }
      return url;
    },

    function find_(x, id) {
      var url = this.address + '/' + id;
      var sessionId = localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(url);
      req.method = 'GET';
      req.responseType = 'blob';

      var self = this;
      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(blob) {
        return self.BlobBlob.create({
          blob: blob
        });
      });
    }
  ]
});
