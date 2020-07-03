/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'NextStepView',
  extends: 'foam.u2.View',

  documentation: 'next step view',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'notify',
    'user',
    'userDAO',
    'window'
  ],

  messages: [
    { name: 'Title',       message: '1. Next Step' },
    { name: 'Description', message: 'Go to portal and start using the nanopay services.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .start().addClass('containerDesc').add(this.Description).end()
        .br()
        .start(this.GO_TO_PORTAL).end();
    }
  ],

  actions: [
    {
      name: 'goToPortal',
      code: function (X) {
        X.user.onboarded = true;

        X.userDAO.put(X.user)
        .then(function (result) {
          X.window.location.hash = '';
          X.window.location.reload();
        })
        .catch(function (err) {
          X.notify('Sorry something went wrong.', '', X.LogLevel.ERROR, true);
        });
      }
    }
  ]
});