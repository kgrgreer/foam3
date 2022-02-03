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
    'subject'
  ],

  css: `
    ^ {
      width: inherit;
      margin-bottom: 48px;
    }
  `,

  properties: [
    'prefix'
  ],

  methods: [
    function render() {
      this.addClasses([this.myClass(), 'h200'])
        .start()
          .add(this.slot(function(subject$user) {
            return this.prefix + ((this.subject.user != null) ? ', ' + this.subject.user.firstName : '');
          }))
        .end();
    }
  ]
});
