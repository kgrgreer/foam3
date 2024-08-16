/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'GoogleTagAgent',

  documentation: `
    track user conversion with gtag
  `,

  exports: ['googleTagAgent'],

  topics: ['googleTagAgent'],

  properties: [
    {
      class: 'String',
      name: 'tagId'
    }
  ],

  methods: [
    function init() {
      window.dataLayer = window.dataLayer || [];
      this.sub('userCreated', this.userCreatedListener);
      this.sub('userOnboarded', this.userOnboardedListener);
    },
    function gtag(){
      dataLayer.push(arguments);
    }
  ],
  
  listeners: [
    {
      name: 'userCreatedListener',
      isMerged: true,
      mergeDelay: 20000,
      code: function() {
        this.gtag('js', new Date());
        this.gtag('config', this.tagId); 
      }
    },
    {
      name: 'userOnboardedListener',
      isMerged: true,
      mergeDelay: 20000,
      code: function() {
        this.gtag('event', 'conversion', {'send_to': `${this.tagId}/x3hzCPTWssYZEOaul6oq`}); 
      }
    }
  ]
});
