/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'Router',
  extends: 'foam.u2.Controller',
  mixins: [ 'foam.u2.memento.Memorable' ],
  implements: ['foam.u2.Routable'],

  documentation: `A special type of controller class that simplifies handling of breadcrumbs, stacks and mementos.
    Routers must instantiate using the addCrumb() (usually in the init()).
  `,

  exports: [ 'route' ],
  imports: ['breadcrumbs?', 'stack?'],

  // topics: ['routedTo'],
  properties: [
    {
      name: 'route',
      memorable: true
    },
    ['routingFeedback_', false]
  ],
  methods: [
    function addCrumb() {
      // Simplest implementation of adding breadcrumbs, other routers 
      // might need something more complex
      this.breadcrumbs?.push(this);
      this.dynamic(function(route) {
        this.routeChange();
      })
    },
    function routeToMe() {
      if ( this.routingFeedback_ ) return;
      if ( this.isDetached() ) {
        console.error('******routing to a detached controller');
        return;
      }
      this.routingFeedback_ = true;
      this.clearProperty('route'); this.route;
      this.memento_.detachTail();
      this.routingFeedback_ = false;
    },
    function routeChange() {
      if ( this.routingFeedback_ ) return;
      this.routingFeedback_ = true;
      if ( ! this.route ) {
        this.getPrivate_('crumb')?.go();
      }
      this.routingFeedback_ = false;
    }
  ]
});

// Used to test if classes mixing in Router are routeable
foam.INTERFACE({
  package: 'foam.u2',
  name: 'Routable'
});