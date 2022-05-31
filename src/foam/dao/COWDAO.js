/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'COWDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    <pre>
     _______________
    < copy-on-write >
     ---------------
            \   ^__^
             \  (oo)\_______
                (__)\       )\/\
                    ||----w |
                    ||     ||
    </pre>

    This ProxyDAO implements copy-on-write behaviour between two DAOs.
    'delegate' is considered the source and is not written to.
    For each object updated, 'copyDAO' will store the original object as well
    as the changes.

    Serialize the COWDAO itself to store copied data; storing the contents of
    copyDAO will omit information about removals against the source DAO.
  `,

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.DedupSink'
  ],

  javaImports: [
    'java.util.HashSet'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'idsCopied',
      documentation: 'Array of copied IDs kept when COWDAO is serialized.',
      getter: `,
        return Array.from(this.idCache);
      `,
      javaGetter: `
        return (String[]) getIdCache().toArray(new String[0]);
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'copyDAO'
    },
    {
      class: 'Object',
      name: 'idCache',
      documentation: 'Working memory for copied IDs.',
      javaType: 'java.util.HashSet',
      hidden: true,
      transient: true,
      factory: function () {
        return new Set(this.instance_.idsCopied);
      },
      javaFactory: `
        var set = new HashSet<String>();
        for ( String id : idsCopied_ ) {
          set.add(id);
        }
        return set;
      `
    },
    {
      class: 'Boolean',
      name: 'enableRetroRemove',
      documentation: `
        Setting this to true will have COWDAO remember removals on objects even
        if they weren't found in the source DAO. This way if the COWDAO is
        applied to a later version of the source DAO that has these objects
        they will be removed. This is called "retro remove" here because it can
        mark an object for deletion before it exists.
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      code: async function put_ (x, obj) {
        if ( ! this.idCache.has(obj.id) ) {
          this.idCache.add(obj.id);

          // Copy from source DAO if it already has this object
          let sourceObj = await this.delegate.find_(x, obj);
          if ( sourceObj != null ) {
            this.copyDAO.put_(x, sourceObj);
          }
        }

        return await this.copyDAO.put_(x, obj);
      }
    },
    {
      name: 'find_',
      code: function (x, obj) {
        const id = this.adaptFindId_(obj);
        if ( this.idCache.has(id) ) return this.copyDAO.find_(x, obj);
        return this.delegate.find_(x, obj);
      }
    },
    {
      name: 'remove_',
      code: async function (x, obj) {
        const id = this.adaptFindId_(obj);

        // ArrayDAO doesn't support passing strings to .remove()
        obj = typeof obj === 'string' ? { id: obj } : obj;

        if ( this.idCache.has(id) ) {
          return await this.copyDAO.remove_(x, obj);
        }
        const originalObj = await this.delegate.find_(x, obj);
        if ( ! this.enableRetroRemove && ! originalObj ) return;
        this.idCache.add(id);
        return await this.copyDAO.remove_(x, obj);
      }
    },
    {
      name: 'select_',
      code: async function select_(x, sink, skip, limit, order, predicate) {
        sink = sink || this.ArraySink.create();
        var ddSink = this.DedupSink.create({ delegate: sink })
        await this.copyDAO.select_(x, ddSink, skip, limit, order, predicate);
        for ( const k of this.idCache ) {
          ddSink.results[k] = true;
        }
        await this.delegate.select_(x, ddSink, skip, limit, order, predicate);
        return sink;
      },
      javaCode: `
        sink = prepareSink(sink);
        var ddSink = new DedupSink();
        ddSink.setDelegate(sink);
        getCopyDAO().select_(x, ddSink, skip, limit, order, predicate);
        super.select_(x, ddSink, skip, limit, order, predicate);
        return sink;
        
      `
    },
    {
      name: 'removeAll_',
      code: function (x, ...selectArgs) {
        this.select_(x, this.RemoveSink.create({ x, dao: this }), ...selectArgs)
      }
    },
    {
      name: 'adaptFindId_',
      type: 'String',
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      code: function adaptFindId_(obj) {
        return typeof obj === 'string' ? obj : obj.id;
      },
      javaCode: `
        if ( obj instanceof String ) {
          return (String) obj;
        }
        return (String) ((foam.core.FObject) obj).getProperty("id");
      `
    }
  ]
});
