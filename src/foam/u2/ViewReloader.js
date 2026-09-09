/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewReloader',

  documentation: `Dev-only. Picks up a .js edit without a page reload (#5403).
    Listens on sourceChangeDAO (fed by foam.core.fs.SourceWatcher), re-runs the
    changed file as a <script> tag after clearing its classes from the context
    cache, then either swaps the stylesheet when only css: changed or replaces
    on-screen instances of the rebuilt classes in place. Created by
    ApplicationController.onClientLoad when the page is not running foam-bin.

    What it cannot do, and says so in the console: a file that defines a
    foam.SCRIPT, a class in foam.lang, and an instance rendered through a
    SlotNode all ask for a page reload.`,

  properties: [
    {
      name: 'root',
      documentation: 'Element whose subtree holds the views to rebuild; ' +
          'the ApplicationController in an app.'
    }
  ],

  methods: [
    function pathOf(source) {
      /* Pathname of a Model.source URL, without the ?t= query a reload adds. */
      return source ? new URL(source).pathname : '';
    },

    function modelsFor(path) {
      /* Models defined by the file at path. foam.CLASS stamps Model.source with
         document.currentScript.src (EndBoot.js), so the models know. */
      return Object.values(foam.USED).concat(Object.values(foam.UNUSED))
        .filter(m => this.pathOf(m.source) === path);
    },

    function isCssOnly(oldCls, newCls) {
      /* True when the two models differ in css: and nothing else. The css
         postSet pushes a foam.u2.CSS axiom into axioms_, so that is stripped too. */
      var strip = cls => {
        var m = { ...cls.model_.instance_ };
        delete m.css;
        delete m.order;
        delete m.source;
        m.axioms_ = (m.axioms_ || []).filter(a => ! foam.u2.CSS.isInstance(a));
        return foam.json.Compact.stringify(m);
      };
      return oldCls.model_.css !== newCls.model_.css && strip(oldCls) === strip(newCls);
    },

    function cascade(ids, path) {
      /* Rebuild every USED subclass of the reloaded ids, parents first, and
         re-apply every refinement of them that lives in another file (a
         refinement in the reloaded file already re-ran with it). Returns the
         full list of rebuilt ids. UNUSED models need nothing: their factory
         builds lazily against the new parent. */
      var used  = Object.values(foam.USED);
      var order = ids.slice();
      var set   = new Set(ids);
      for ( var grew = true ; grew ; ) {
        grew = false;
        used.forEach(m => {
          if ( ! m.refines && set.has(m.extends) && ! set.has(m.id) ) {
            set.add(m.id);
            order.push(m.id);
            grew = true;
          }
        });
      }
      order.forEach((id, i) => {
        if ( i >= ids.length ) {
          delete foam.__context__.__cache__[id];
          foam.CLASS(foam.USED[id]);
        }
        used
          .filter(m => m.refines === id && this.pathOf(m.source) !== path)
          .forEach(m => foam.CLASS(m));
      });
      return order;
    },

    function rebuild(ids) {
      /* Replace the topmost instances of the rebuilt classes under root. A
         SlotNode renders its value outside its parent's childNodes, so an
         instance found there is counted as skipped instead of replaced; its
         own children are still walked, since a skip means only that instance
         couldn't be swapped, not that its subtree is out of bounds. */
      var result = { rebuilt: 0, skipped: 0 };
      var visit  = e => {
        if ( ! e || typeof e === 'string' ) return;
        if ( e.cls_ && ids.includes(e.cls_.id) ) {
          if ( this.replace(e) ) { result.rebuilt++; return; }
          result.skipped++;
        }
        if ( foam.u2.SlotNode.isInstance(e) ) { visit(e.node); return; }
        ( e.childNodes || [] ).forEach(visit);
      };
      visit(this.root);
      return result;
    },

    function replace(old) {
      /* Create the new-class twin of old with every property old set that its
         own class declares, excluded by NAME against foam.u2.Element (which
         also covers Node, its parent) rather than by sourceCls_: sourceCls_ is
         whichever class last installed the axiom, so a view that re-declares
         an Element-level name (controllerMode, shown, nodeName) would
         otherwise slip through and get linked to the old instance instead of
         running its own factory. hasOwnProperty is also true once a factory
         has materialized a value (Property.js:536), so a factory-backed
         property is pinned to old's value on reload, same as an explicitly
         set one. Properties are linked by slot so a data$ binding stays
         two-way through old, then swap it into the parent. */
      var parent = old.parentNode;
      if ( ! parent || ! parent.childNodes.includes(old) ) return false;

      var newCls = foam.lookup(old.cls_.id);
      var args   = {};
      old.cls_.getAxiomsByClass(foam.lang.Property).forEach(p => {
        if ( foam.u2.Element.getAxiomByName(p.name) ) return;
        if ( ! old.hasOwnProperty(p.name) || ! newCls.getAxiomByName(p.name) ) return;
        args[p.name + '$'] = old.slot(p.name);
      });
      // old is kept alive on purpose, as the slot relay between new and
      // whatever old was linked to: replaceChild (Element2.js:1110-1123) has
      // already overwritten childNodes[i] with newE by the time it calls
      // oldE.remove(), so removeChild's search for old (Element2.js:1091-1108)
      // finds nothing and old.detach() never runs -- if it did, old's own
      // link to its data source would tear down and the chain would break.
      // removeChild's own `TODO: set c.parentNode to undefined` would break
      // this too, if ever acted on. old's listeners keep firing against
      // orphaned DOM, and each reload adds one more link; acceptable for a
      // dev-only tool. Do not add old.detach() here.
      parent.replaceChild(newCls.create(args, old.__context__), old);
      return true;
    }
  ]
});
