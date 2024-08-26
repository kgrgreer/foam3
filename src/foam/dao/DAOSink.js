/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DAOSink',

  implements: [ 'foam.dao.Sink' ],

  properties: [
    { class: 'foam.dao.DAOProperty', name: 'dao' },
  ],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(o) {
        this.dao.put(o);
      },
      javaCode: `getDao().put((foam.core.FObject)obj);`,
      swiftCode: '_ = try? dao?.put(obj as? foam_core_FObject)'
    },
    {
      name: 'remove',
      code: function(o) {
        this.dao.remove(o);
      },
      javaCode: `getDao().remove((foam.core.FObject)obj);`,
      swiftCode: '_ = try? dao?.remove(obj as? foam_core_FObject)'
    },
    {
      name: 'eof',
      code: function() {},
      javaCode: `// NOOP`,
      swiftCode: '// NOOP'
    },
    {
      name: 'reset',
      code: function() {
        this.dao.removeAll();
      },
      javaCode: `getDao().removeAll();`,
      swiftCode: '_ = try? dao?.removeAll()',
    }
  ]
});
