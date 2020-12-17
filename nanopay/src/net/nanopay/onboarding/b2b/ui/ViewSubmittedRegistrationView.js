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
  name: 'ViewSubmittedRegistrationView',
  extends: 'foam.u2.Controller',

  documentation: 'View Submitted Registration View',

  requires: [
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'user',
    'stack',
    'ctrl'
  ],

  css: `
    ^ .link {
      text-decoration: none;
    }
  `,

  messages: [
    { name: 'Title',        message: '2. View Submitted Registration' },
    { name: 'Description1', message: 'You can view the registration details, but please be aware that you can no longer edit the profile. If you want to make any changes, please contact ' },
    { name: 'Description2', message: 'You can view the registration details, but please be aware that you won’t be able to edit them here. If you want to make any changes, please go to portal and edit in the setting.' },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .add(this.slot(function (status) {
          if ( status !== self.AccountStatus.ACTIVE ) {
            return this.E()
              .start().addClass('containerDesc')
                .add(self.Description1)
                .start('a').addClass('link')
                  .attrs({ href: 'mailto:support@nanopay.net' })
                  .add('support@nanopay.net')
                .end()
              .end()
          } else {
            return this.E()
              .start().addClass('containerDesc')
                .add(self.Description2)
              .end()
          }
        }, this.user.status$))
        .br()
        .start(this.VIEW_PROFILE).end();
    }
  ],

  actions: [
    {
      name: 'viewProfile',
      code: function (X) {
        this.ctrl.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.ViewSubmittedProfileView'});
      }
    }
  ]
});