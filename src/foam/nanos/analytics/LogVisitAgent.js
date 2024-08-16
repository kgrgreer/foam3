/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'LogVisitAgent',
  documentation: `
    log an analyticevent when certain urlsearchparams are present
  `,

  imports: [
    'window'
  ],

  methods: [
    function init() {
      this.logVisit();
    }
  ],

  listeners: [
    {
      name: 'logVisit',
      isMerged: true,
      mergeDelay: 20000,
      code: function() {
        if ( ! this.window.location.search ) return;
        extras = Object.fromEntries(
          [...(new URLSearchParams(this.window.location.search))]
            .filter(
              ([key]) => key.startsWith('utm_') || key == 'referral'
            )
        );
        this.__subContext__.analyticEventDAO.put(
          foam.nanos.analytics.AnalyticEvent.create({
            name: 'REFERRAL_OR_AD_CAMPAIGN_VISIT',
            extra: foam.json.stringify(extras)
          }),
          this);
        localStorage['visited'] = this.window.location.search;
      }
    }
  ]
});
