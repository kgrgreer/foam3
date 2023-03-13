foam.CLASS({
  package: 'foam.dao',
  name: 'NoSelectDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.Expr'
  ],

  methods: [
    {
      name: 'select_',
      code: async function select_ () {
        return this.ArraySink.create();
      },
      javaCode: `
        return prepareSink(sink);
      `
    },
    {
      name: 'find_',
      code:  async function find_(id) {
        if ( this.Predicate.isInstance(id) || this.Expr.isInstance(id) ) {
          return null;
        }
        this.delegate.find_(id);
      },
      javaCode: `
        if ( id instanceof foam.mlang.predicate.Predicate ) {
          return null;
        }
        return getDelegate().find_(x, id);
      `
    }
  ]
});
