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
    'params',
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
        var extras = Object.keys(this.params)
          .filter(key => key.startsWith('utm_') || key == 'referral')
          .reduce((obj, key) => {
              obj[key] = this.params[key];
              return obj;
            }, {});
        this.__subContext__.analyticEventDAO.put(
          foam.nanos.analytics.AnalyticEvent.create({
            name: 'REFERRAL_OR_AD_CAMPAIGN_VISIT',
            extra: foam.json.stringify(extras)
          }),
          this);
      }
    }
  ]
});
