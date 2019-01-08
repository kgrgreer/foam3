foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'ExcludeMissingBusinessContactDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Filter out contact associated with disabled business.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'net.nanopay.contacts.Contact',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink decoratedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject result = read(getX(), (FObject) obj);
              if ( result != null ) {
                super.put(result, sub);
              }
            }
          };
          super.select_(x, decoratedSink, skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      javaReturns: 'Contact',
      args: [
        { of: 'foam.core.X', name: 'x' },
        { of: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        Contact result = (Contact) obj;

        // NOTE: Exclude a contact if it is associated with a business but
        //       the business record could not be retrieved.
        if ( result != null
          && result.getBusinessId() != 0
          && result.findBusinessId(x) == null
        ) {
          return null;
        }
        return result;
      `
    }
  ]
});
