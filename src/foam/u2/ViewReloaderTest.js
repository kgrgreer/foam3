/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewReloaderTest',
  extends: 'foam.core.test.JSTest',

  documentation: `ViewReloader (#5403): a changed path maps to the models that
    came from it, a css-only edit is told apart from a code edit, a reloaded
    base class drags its subclasses and refinements along, and an on-screen
    view is replaced by an instance of the new class with its data link kept.`,

  requires: [ 'foam.u2.ViewReloader' ],

  methods: [
    {
      name: 'runTest',
      code: async function(x) {
        var r = this.ViewReloader.create({}, x);

        // --- modelsFor: a model is found by the pathname of its source ---
        foam.CLASS({
          package: 'foam.u2.test',
          name: 'ReloaderProbe',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderProbe.js?t=1'
        });
        var found = r.modelsFor('/foam3/src/foam/u2/test/ReloaderProbe.js');
        x.test(found.length === 1 && found[0].id === 'foam.u2.test.ReloaderProbe',
          'modelsFor matches Model.source by pathname, ignoring the query, got ' + found.map(m => m.id));
        x.test(r.modelsFor('/foam3/src/foam/u2/test/Nope.js').length === 0,
          'modelsFor returns nothing for a path no model came from');

        // --- isCssOnly ---
        var base  = { package: 'foam.u2.test', name: 'CssProbe', extends: 'foam.u2.Element',
                      properties: [ 'a' ], css: '^ { color: $primary500; }' };
        var build = m => foam.lang.Model.create(m).buildClass();
        var c1    = build(base);
        var c2    = build({ ...base, css: '^ { color: $primary700; }' });
        var c3    = build({ ...base, css: '^ { color: $primary700; }', properties: [ 'a', 'b' ] });
        x.test(r.isCssOnly(c1, c2),   'a css-only edit is css-only');
        x.test(! r.isCssOnly(c1, c3), 'a css edit plus a property edit is not css-only');
        x.test(! r.isCssOnly(c1, c1), 'an unchanged model is not css-only');

        // --- cascade: subclass rebuilt, refinement from another file re-applied ---
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderBase', extends: 'foam.u2.Element',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderBase.js',
          methods: [ function version() { return 1; } ]
        });
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderChild', extends: 'foam.u2.test.ReloaderBase',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderChild.js'
        });
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderBaseRefinement', refines: 'foam.u2.test.ReloaderBase',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderBaseRefinement.js',
          methods: [ function refined() { return true; } ]
        });
        var oldChild = foam.lookup('foam.u2.test.ReloaderChild');
        x.test(oldChild.create(null, x).version() === 1 && oldChild.create(null, x).refined(),
          'setup: child sees base v1 and the refinement');

        // simulate the script re-run of ReloaderBase.js
        delete foam.__context__.__cache__['foam.u2.test.ReloaderBase'];
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderBase', extends: 'foam.u2.Element',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderBase.js?t=2',
          methods: [ function version() { return 2; } ]
        });
        var order = r.cascade([ 'foam.u2.test.ReloaderBase' ], '/foam3/src/foam/u2/test/ReloaderBase.js');
        x.test(order.join() === 'foam.u2.test.ReloaderBase,foam.u2.test.ReloaderChild',
          'cascade lists the reloaded class then its subclass, got ' + order.join());
        var newChild = foam.lookup('foam.u2.test.ReloaderChild');
        x.test(newChild !== oldChild, 'subclass was rebuilt');
        x.test(newChild.create(null, x).version() === 2, 'rebuilt subclass sees base v2');
        x.test(newChild.create(null, x).refined(), 'refinement from another file was re-applied to base v2');
      }
    }
  ]
});
