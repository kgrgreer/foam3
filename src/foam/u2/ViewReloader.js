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
    }
  ]
});
