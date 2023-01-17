/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'Analyticable',
  documentation: `
    Meant to be used as a mixin or in "implements" for convenience
    (like foam.mlang.Expressions). Makes reporting analytic events
    easier without hindering readability of the rest of the code.
  `,

  imports: [
    'analyticsAgent?'
  ],

  methods: [
    function report (name, opt_tags, opt_other) {
      if ( name.startsWith('^') ) {
        name = this.cls_.name + '_' + name.slice(1);
      }

      this.report_({
        name,
        ...(opt_tags ? { tags: opt_tags } : {}),
        ...(opt_other || {})
      });
    },
    function assert (predicate, ...args) {
      if ( ! predicate ) {
        this.report('^_ASSERTION_FAILED', ['assert'], {
          extra: foam.json.stringify(args)
        });
      }
    },
    function report_ (evt) {
      if ( ! this.analyticsAgent ) {
        console.warn('no agent in context to log event', evt);
        return;
      }
      this.analyticsAgent.pub('event', evt);
    }
  ]
});
