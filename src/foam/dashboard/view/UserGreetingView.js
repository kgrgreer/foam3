/**
 * NANOPAY CONFIDENTIAL
 *
 * [2022] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'UserGreetingView',
  extends: 'foam.u2.View',

  imports: [
    'auth',
    'ctrl',
    'subject'
  ],

  css: `
    ^ {
      height: 100%;
      width: 100%;
    }
  `,

  messages: [
    { name: 'MORNING_TITLE', message: 'Good morning' },
    { name: 'AFTERNOON_TITLE', message: 'Good afternoon' },
    { name: 'EVENING_TITLE', message: 'Good evening' }
  ],

  properties: [
    {
      name: 'title',
      factory: function() {
        let hours = new Date().getHours();
        if ( hours >= 5 && hours < 12 ) {
          return this.MORNING_TITLE;
        }
        if ( hours >= 12 && hours < 17 ) {
          return this.AFTERNOON_TITLE;
        }
        return this.EVENING_TITLE;
      }
    }
  ],

  methods: [
    async function render() {
      if ( ! this.subject.realUser?.firstName ) {
        this.subject = await ctrl.__subContext__.auth.getCurrentSubject(null);
      }
      this.addClass(this.myClass(), 'h200')
        .start()
          .add(this.slot(function(subject$realUser) {
            return this.title + (this.subject.realUser.firstName ? ', ' + this.subject.realUser.firstName : '') ;
          }))
        .end();
    }
  ]
});
