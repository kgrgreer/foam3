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

        // --- rebuild: on-screen instance replaced, data link kept two-way ---
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderView', extends: 'foam.u2.View',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderView.js',
          methods: [ function version() { return 1; }, function render() { this.add(this.data$); } ]
        });
        foam.CLASS({ package: 'foam.u2.test', name: 'Holder', properties: [ 'data' ] });
        var holder = foam.u2.test.Holder.create({ data: 'first' }, x);

        var root  = foam.u2.Element.create(null, x);
        var oldV  = foam.u2.test.ReloaderView.create({ data$: holder.data$ }, x);
        root.add(oldV);
        var rr = this.ViewReloader.create({ root: root }, x);

        delete foam.__context__.__cache__['foam.u2.test.ReloaderView'];
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderView', extends: 'foam.u2.View',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderView.js?t=2',
          methods: [ function version() { return 2; }, function render() { this.add(this.data$); } ]
        });

        var res  = rr.rebuild([ 'foam.u2.test.ReloaderView' ]);
        var newV = root.childNodes[0];
        x.test(res.rebuilt === 1 && res.skipped === 0, 'one instance rebuilt, got ' + JSON.stringify(res));
        x.test(newV !== oldV && newV.version() === 2, 'the child is now an instance of the new class');
        x.test(newV.data === 'first', 'data value carried over');
        newV.data = 'second';
        x.test(holder.data === 'second', 'writing through the new view reaches the original holder');
        holder.data = 'third';
        x.test(newV.data === 'third', 'a holder write reaches the new view');
        x.test(! root.element_.contains(oldV.element_), 'old element left the DOM');

        // an instance under a SlotNode is reported, not replaced
        var root2 = foam.u2.Element.create(null, x);
        var slot  = foam.lang.SimpleSlot.create({ value: foam.u2.test.ReloaderView.create({ data: 'x' }, x) });
        root2.add(slot);
        var rr2  = this.ViewReloader.create({ root: root2 }, x);
        var res2 = rr2.rebuild([ 'foam.u2.test.ReloaderView' ]);
        x.test(res2.rebuilt === 0 && res2.skipped === 1, 'a SlotNode-hosted instance is skipped and counted, got ' + JSON.stringify(res2));

        // a SlotNode-hosted instance is skipped, but its own child is still
        // walked and replaced
        var root3  = foam.u2.Element.create(null, x);
        var outer  = foam.u2.test.ReloaderView.create({ data: 'outer' }, x);
        var nested = foam.u2.test.ReloaderView.create({ data: 'inner' }, x);
        outer.add(nested);
        var slot3 = foam.lang.SimpleSlot.create({ value: outer });
        root3.add(slot3);
        var rr3 = this.ViewReloader.create({ root: root3 }, x);

        delete foam.__context__.__cache__['foam.u2.test.ReloaderView'];
        foam.CLASS({
          package: 'foam.u2.test', name: 'ReloaderView', extends: 'foam.u2.View',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/ReloaderView.js?t=3',
          methods: [ function version() { return 3; }, function render() { this.add(this.data$); } ]
        });

        var res3 = rr3.rebuild([ 'foam.u2.test.ReloaderView' ]);
        x.test(res3.rebuilt === 1 && res3.skipped === 1,
          'a SlotNode-hosted view is skipped but its own child is still replaced, got ' + JSON.stringify(res3));

        // --- replace: an Element-level property name re-declared by a
        //     subclass is still excluded by name, not sourceCls_ ---
        foam.CLASS({
          package: 'foam.u2.test', name: 'CMProbe', extends: 'foam.u2.Element',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/CMProbe.js',
          properties: [
            { name: 'controllerMode', factory: function() { return foam.u2.ControllerMode.VIEW; } }
          ],
          methods: [ function version() { return 1; } ]
        });
        var root4 = foam.u2.Element.create(null, x);
        var oldCM = foam.u2.test.CMProbe.create({}, x);
        oldCM.controllerMode = foam.u2.ControllerMode.EDIT;
        root4.add(oldCM);
        var rr4 = this.ViewReloader.create({ root: root4 }, x);

        delete foam.__context__.__cache__['foam.u2.test.CMProbe'];
        foam.CLASS({
          package: 'foam.u2.test', name: 'CMProbe', extends: 'foam.u2.Element',
          source: 'http://localhost:8080/foam3/src/foam/u2/test/CMProbe.js?t=2',
          properties: [
            { name: 'controllerMode', factory: function() { return foam.u2.ControllerMode.VIEW; } }
          ],
          methods: [ function version() { return 2; } ]
        });

        rr4.rebuild([ 'foam.u2.test.CMProbe' ]);
        var newCM = root4.childNodes[0];
        x.test(newCM !== oldCM && newCM.version() === 2, 'CMProbe was rebuilt');
        x.test(newCM.controllerMode === foam.u2.ControllerMode.VIEW,
          'a redeclared Element-level property name is excluded by name, not sourceCls_, got ' + newCM.controllerMode);
      }
    }
  ]
});
