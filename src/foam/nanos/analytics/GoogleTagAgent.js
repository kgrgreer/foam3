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
    push event to datalayer until user onboarded
  `,

  exports: ['googleTagAgent'],

  topics: ['googleTagAgent'],

  properties: [
    {
      class: 'String',
      name: 'tagId'
    },
    {
      class: 'Boolean',
      name: 'pushEvent',
      value: true,
      documentation: 'turn off after user onboarded'
    }
  ],

  methods: [
    async function init() {
      this.pushEvent = await this.shouldTrackConversion();
      if ( ! this.pushEvent ) return;
      this.onDetach(this.__subContext__.subject$.sub(async(subject) => {
        // re-check should track when subject changes
        this.pushEvent = await this.shouldTrackConversion(subject);
      }));

      window.dataLayer = window.dataLayer || [];

      // listen to menu changes and wizard progressions
      window.addEventListener('popstate', this.userOnboardingListener);
      this.sub('wizardEvent', this.userOnboardingListener);

      // listen to generalcapability completed
      this.sub('userOnboarded', this.userOnboardedListener);

      this.userOnboardingListener();
    },

    function gtag(){
      dataLayer.push(arguments);
    },

    async function shouldTrackConversion(subject) {
      // return true if user not logged in or if generalcapability not completed
      var x = this.__subContext__;
      subject = subject || x.subject;
      if ( ! x.loginSuccess || ! subject?.user ) return true;
      var group = await x.groupDAO.find(subject.user?.group);
      if ( ! group || ! group.generalCapability ) return false;

      var ucj = await x.crunchService.getJunction(null, group.generalCapability);
      if ( ucj != null && ucj.status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) return false;

      return true;
    }
  ],
  
  listeners: [
    {
      name: 'userOnboardingListener',
      code: function() {
        if ( ! this.pushEvent ) return;
        this.gtag('js', new Date());
        this.gtag('config', this.tagId); 
      }
    },
    {
      name: 'userOnboardedListener',
      isMerged: true,
      mergeDelay: 20000,
      code: function() {
        if ( ! this.pushEvent ) return;
        this.gtag('event', 'conversion', {'send_to': `${this.tagId}/x3hzCPTWssYZEOaul6oq`}); 
        this.pushEvent = false;
      }
    }
  ]
});
