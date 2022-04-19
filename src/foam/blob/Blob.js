/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.blob',
  name: 'Blob',

  proxy: true,

  methods: [
    {
      name: 'read',
      async: true,
      type: 'Long',
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        },
        {
          name: 'offset',
          type: 'Long'
        },
        {
          name: 'length',
          type: 'Long'
        }
      ]
    },
    // TODO: Decide on whether we're adding properties and especially
    // read-only properties to interfaces.  It seems inconsistent to
    // use .getSize() in JS when most other property like things are
    // done with just .size
    {
      name: 'getSize',
      type: 'Long'
    }
  ]
});


foam.INTERFACE({
  package: 'foam.blob',
  name: 'BlobService',

  documentation: 'BlobService Interface',

  methods: [
    {
      name: 'put',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'put_',
      async: 'true',
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'find',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'find_',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'urlFor',
      type: 'String',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'urlFor_',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlob',
  abstract: true,

  implements: [ 'foam.blob.Blob' ],

  methods: [
    {
      name: 'slice',
      type: 'foam.blob.Blob',
      args: [ { name: 'offset', type: 'Long' },
              { name: 'length', type: 'Long' } ],
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this,
          offset: offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob.Builder(getX()).setParent(this).setOffset(offset).setSize(length).build();'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlobService',
  abstract: true,

  implements: [ 'foam.blob.BlobService' ],

  requires: [
    'foam.blob.ProxyBlobService'
  ],

  methods: [
    {
      name: 'inX',
      type: 'foam.blob.BlobService',
      args: [ { name: 'x', type: 'Context' }],
      code: function (x) {
        return this.ProxyBlobService.create({ delegate: this }, x);
      },
      javaCode: 'return new foam.blob.ProxyBlobService.Builder(x).setDelegate(this).build();'
    },
    {
      name: 'put',
      code: function put(blob) {
        return this.put_(this.__context__, blob);
      },
      javaCode: 'return this.put_(getX(), blob);'
    },
    {
      name: 'find',
      code: function find(id) {
        return this.find_(this.__context__, id);
      },
      javaCode: 'return this.find_(getX(), id);'
    },
    {
      name: 'urlFor',
      code: function urlFor(blob) {
        return this.urlFor_(this.__context__, blob);
      },
      javaCode: 'return this.urlFor_(getX(), blob);'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ProxyBlobService',
  extends: 'foam.blob.AbstractBlobService',

  documentation: 'Proxy implementation for the BlobService interface',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.blob.BlobService',
      name: 'delegate',
      forwards: [ 'put_', 'find_', 'urlFor_' ]
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'SubBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Blob',
      name: 'parent',
    },
    {
      class: 'Long',
      name: 'offset'
    },
    {
      class: 'Long',
      name: 'size',
      assertValue: function(value) {
        foam.assert(this.offset + value <= this.parent.size, 'Cannot create sub blob beyond end of parent.');
      }
    }
  ],

  methods: [
    {
      name: 'read',
      code: function read(buffer, offset) {
        if ( buffer.length > this.size - offset) {
          buffer = buffer.slice(0, this.size - offset);
        }

        return this.parent.read(buffer, offset + this.offset);
      },
      javaCode: `length = Math.min(length, getSize() - offset);
return getParent().read(out, offset, length);`
    },
    {
      name: 'slice',
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this.parent,
          offset: this.offset + offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob(getParent(), getOffset() + offset, length);'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  extends: 'foam.blob.AbstractBlob',
  flags: ['web'],

  properties: [
    {
      name: 'blob',
      cloneProperty: function(value, map) {
        map[this.name] = value;
      }
    },
    {
      name: 'size',
      factory: function() {
        return this.blob.size;
      }
    }
  ],

  methods: [
    function read(out, offset, length) {
      var reader = new FileReader();

      var b = this.blob.slice(offset, offset + length);

      return new Promise(function(resolve, reject) {
        reader.onload = function(e) {
          out(reader.result);
          resolve();
        };

        reader.onerror = function(e) {
          reject(e);
        };

        reader.readAsArrayBuffer(b);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'IdentifiedBlob',
  extends: 'foam.blob.ProxyBlob',

  imports: [
    'BlobStore blobStore?',
    'blobService'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.blobService.find(this.id);
      },
      javaFactory: `
        return ((BlobService) getBlobStore()).find(getId());
      `,
      cloneProperty: function () {},
      diffProperty: function () {},
      javaCloneProperty: '// noop',
      javaDiffProperty: '// noop',
      javaCompare: 'return 0;',
      javaComparePropertyToObject: 'return 0;',
      javaComparePropertyToValue: 'return 0;',
    }
  ],

  methods: [
    function read(buffer, offset) {
      return this.delegate.then(function(d) {
        return d.read(buffer, offset);
      });
    },

    {
      name: 'compareTo',
      type: 'int',
      args:
        [
          {
            name: 'o',
            type: 'Object',
          }
        ],
      javaCode: `
        IdentifiedBlob o2 = (IdentifiedBlob) o;
        if ( o2 == null ) return 1;
        if ( o2 == this ) return 0;
        return foam.util.SafetyUtil.compare(getId(), o2.getId());
      `,
      code: function(other) {
        if ( other === null ) return 1;
        return this.id.localeCompare(other.id);
      },
    },
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'foam.core.FObjectProperty',

  flags: [],

  properties: [
    [ 'type', 'foam.blob.Blob' ],
    [ 'of', 'foam.blob.Blob' ],
    [ 'tableCellView', function() {} ],
    [ 'view', { class: 'foam.u2.view.BlobView' } ]
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ClientBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Stub',
      of: 'foam.blob.Blob',
      name: 'delegate',
      methods: [ 'read' ]
    },
    {
      class: 'Long',
      name: 'size'
    }
  ],
  methods: [
    function getSize() { return this.size; }
  ]
});


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


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobServiceDecorator',
  extends: 'foam.dao.AbstractDAODecorator',

  flags: [],

  imports: [
    'blobService'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var props = obj.cls_.getAxiomsByClass(foam.core.Blob);
      var self = this;

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var blob = prop.f(obj);

        if ( ! blob ) return a();

        return self.blobService.put(blob).then(function(b) {
          prop.set(obj, b);
          return a();
        });
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'TestBlobService',
  extends: 'foam.blob.AbstractBlobService',

  flags: [],

  requires: [
    'foam.blob.IdentifiedBlob',
    'foam.blob.BlobBlob'
  ],

  properties: [
    {
      class: 'Map',
      name: 'blobs'
    },
    {
      class: 'Int',
      name: 'nextId',
      value: 1
    }
  ],

  methods: [
    function put_(x, file) {
      var id = this.nextId++;
      this.blobs[id] = file;
      return Promise.resolve(this.IdentifiedBlob.create({ id: id }));
    },

    function find_(x, id) {
      return Promise.resolve(this.blobs[id] ?
        this.BlobBlob.create({ blob: this.blobs[id] }) :
        null);
    },

    function urlFor_(x, blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        return URL.createObjectURL(this.blobs[blob.id]);
      }
      if ( this.BlobBlob.isInstance(blob) ) {
        return URL.createObjectURL(blob.blob);
      }

      return null;
    }
  ]
});
