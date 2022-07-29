foam.CLASS({
  package: 'foam.nanos.contra',
  name: 'Frame',
  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      name: 'x',
      javaFactory: `
        return foam.core.EmptyX.instance();
      `,
      javaPostSet: `
        var parentFrame = getX().get(Frame.class);
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.contra.Frame',
      name: 'parent'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Object',
      javaType: 'List<Frame>',
      name: 'children',
      storageTransient: true,
      javaFactory: `
        return new ArrayList<Frame>();
      `
    }
  ],

  javaCode: `
    public static Frame get (X x) {
      var frame = x.get(Frame.class);
      if ( frame == null ) {
        throw new RuntimeException("Tried to get non-existent frame");
      }
      return frame;
    }

    public static X create (X x, String name) {
      var frame = new Frame();
      frame.setX(x);
      frame.setName(name);
      var parent = (Frame) x.get(Frame.class);
      if ( parent != null ) {
        frame.setParent(parent);
        parent.addChild(frame);
      }
      return x.put(Frame.class, frame);
    }
  `,

  methods: [
    {
      name: 'addChild',
      args: [
        { type: 'Frame', name: 'obj' }
      ],
      javaCode: `
        getChildren().add(obj);
      `
    },
    {
      name: 'getPathString',
      type: 'String',
      javaCode: `
        var lis = new ArrayList<String>();
        var frame = this;
        do {
          lis.add(frame.getName());
          frame = frame.getParent();
        } while ( frame != null );
        var arr = lis.toArray(String[]::new);
        return String.join("->", arr);
      `
    }
  ]
});
