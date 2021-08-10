/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PipelinePMDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware'
  ],

  requires: [
    'foam.nanos.pm.PM'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.boot.NSpec',
    'foam.nanos.pm.PipelinePMLocator',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      class: 'Int',
      name: 'level'
    },
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'classType',
      class: 'Class',
      javaFactory: `
        return PipelinePMDAO.getOwnClassInfo();
      `,
      hidden: true
    },
    {
      name: 'putName',
      class: 'String',
      javaFactory: 'return createName_("put");',
      visibility: 'RO'
    },
    {
      name: 'findName',
      class: 'String',
      javaFactory: 'return createName_("find");',
      visibility: 'RO'
    },
    {
      name: 'selectName',
      class: 'String',
      javaFactory: 'return createName_("select");',
      visibility: 'RO'
    },
    {
      name: 'removeName',
      class: 'String',
      javaFactory: 'return createName_("remove");',
      visibility: 'RO'
    },
    {
      name: 'removeAllName',
      class: 'String',
      javaFactory: 'return createName_("removeAll");',
      visibility: 'RO'
    },
    {
      name: 'cmdName',
      class: 'String',
      javaFactory: 'return createName_("cmd");',
      visibility: 'RO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
    `public PipelinePMDAO(X x, NSpec nspec, DAO delegate, int level) {
      setX(x);
      setNSpec(nspec);
      setLevel(level);
      setDelegate(delegate);
      init_();
     }

     public static DAO decorate(X x, NSpec nspec, DAO dao, int level) {
       if ( dao instanceof PipelinePMDAO  ) return dao;
       if ( dao instanceof ProxyDAO ) {
         ProxyDAO proxy = (ProxyDAO) dao;

         proxy.setDelegate(new EndPipelinePMDAO(x, decorate(x, nspec, proxy.getDelegate(), level+1)));
       }
       return new PipelinePMDAO(x, nspec, dao, level);
     }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'createName_',
      args: [ {name: 'name', type: 'String '} ],
      javaType: 'String',
      javaCode: `
        String spec = ( getNSpec() == null ) ? "NOSPEC" : getNSpec().getName();
        return spec + "." + name + "(" + String.format("%03d", getLevel()) + ")" + " " + getDelegate().getClass().getSimpleName();
      `
    },
    {
      documentation: `
Creates the PM that will measure the performance of each operation and creates a new context with it as a variable which the EndPipelinePMDAO
   *  will use to access the pm after it is passed onto it through the arguments of the DAO operations
`,
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
        PM pm = new PM();
        pm.setKey(getClassType().getId());
        pm.setName(op);
        pm.init_();
        return pm;
//      return PM.create(x, getClassType(), op);
      `
    },
    {
      documentation: `
Creates the PM pipeline by adding an EndPipelinePMDAO after of this class only if it is a ProxyDAO.
If the delegate of that is also a ProxyDAO, creates a new PipelinePMDAO in the chain beofre it which repeats this procedure recursively.
`,
      name: 'createPipeline',
      javaCode: `
      `
    },
    {
      name: 'reset',
      args: [
        {
          name: 'x',
          type: 'X',
        },
        {
          name: 'old',
          type: 'PM'
        }
      ],
      javaCode: `
        PM pm = PipelinePMLocator.get();
        // Log the PM if the EndPipelinePMDAO didn't already do it
        if ( pm.getEndTime() == 0L ) {
          pm.log(x);
        }
        PipelinePMLocator.set(old);
      `
    },
    {
      name: 'put_',
      javaCode: `
        PM old = PipelinePMLocator.get();
        try {
          PipelinePMLocator.set(createPM(x, getPutName()));

          return getDelegate().put_(x, obj);
        } finally {
          reset(x, old);
        }
     `
    },
    {
      name: 'find_',
      javaCode: `
      PM old = PipelinePMLocator.get();
      try {
        PipelinePMLocator.set(createPM(x, getFindName()));

        return getDelegate().find_(x, id);
      } finally {
        reset(x, old);
      }
     `
    },
    {
      name: 'select_',
      javaCode: `
      PM old = PipelinePMLocator.get();
      try {
        PipelinePMLocator.set(createPM(x, getSelectName()));

        return getDelegate().select_(x, sink, skip, limit, order, predicate);
      } finally {
        reset(x, old);
      }
     `
    },
    {
      name: 'remove_',
      javaCode: `
      PM old = PipelinePMLocator.get();
      try {
        PipelinePMLocator.set(createPM(x, getRemoveName()));

        return getDelegate().remove_(x, obj);
      } finally {
        reset(x, old);
      }
     `
    },
    {
      name: 'removeAll_',
      javaCode: `
      PM old = PipelinePMLocator.get();
      try {
        PipelinePMLocator.set(createPM(x, getRemoveAllName()));

        getDelegate().removeAll_(x, skip, limit, order, predicate);
      } finally {
        reset(x, old);
      }
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      PM old = PipelinePMLocator.get();
      try {
        PipelinePMLocator.set(createPM(x, getCmdName()));

        return getDelegate().cmd_(x, obj);
      } finally {
        reset(x, old);
      }
     `
    }
  ],

  classes: [
    {
//      package: 'foam.dao',
      name: 'EndPipelinePMDAO',
      extends: 'foam.dao.ProxyDAO',

      requires: [
        'foam.nanos.pm.PM'
      ],

      javaImports: [
        'foam.core.X',
        'foam.mlang.order.Comparator',
        'foam.mlang.predicate.Predicate',
        'foam.nanos.pm.PM'
      ],

      axioms: [
        {
          name: 'javaExtras',
          buildJavaClass: function(cls) {
            cls.extras.push(foam.java.Code.create({
              data:`
     public EndPipelinePMDAO(X x, DAO delegate) {
       super(x, delegate);
     }
          `
            }));
          }
        }
      ],

      methods: [
        {
          name: 'log',
          args: [
            {
              name: 'x',
              type: 'X',
            }
          ],
          javaType: 'X',
          javaCode: `
      PM pm = PipelinePMLocator.get();
      if ( pm != null ) pm.log(x);
      return x;
      `
        },
        {
          name: 'put_',
          javaCode: 'return super.put_(log(x), obj);'
        },
        {
          name: 'find_',
          javaCode: 'return super.find_(log(x), id);'
        },
        {
          name: 'select_',
          javaCode: 'return super.select_(log(x), sink, skip, limit, order, predicate);'
        },
        {
          name: 'remove_',
          javaCode: 'return super.remove_(log(x), obj);'
        },
        {
          name: 'removeAll_',
          javaCode: 'super.removeAll_(log(x), skip, limit, order, predicate);'
        },
        {
          name: 'cmd_',
          javaCode: 'return super.cmd_(log(x), obj);'
        }
      ]
    }
  ]
});
