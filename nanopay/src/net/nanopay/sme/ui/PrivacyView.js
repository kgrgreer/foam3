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
  package: 'net.nanopay.sme.ui',
  name: 'PrivacyView',
  extends: 'foam.u2.View',

  documentation: `View that displays company/business privacy setting`,

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'user',
    'userDAO',
    'notify'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^info-box {
      width: 48%;
      display: inline-block;
    }
    ^title {
      height: 24px;
      font-size: 16px;
      font-weight: 900;
    }
    ^text-box {
      margin-top: 16px;
      line-height: 1.5;
    }
    ^text {
      color: #8e9090;
      margin: 0;
    }
    ^privacyText {
      color: #2b2b2b;
      font-weight: 600; /* semi-bold */
    }
    ^btn-box {
      width: 50%;
      display: inline-block;
      vertical-align: top;
      text-align: right;
      margin-top: 24px;
    }
  `,

  messages: [
    { name: 'TITLE', message: `Account Privacy` },
    { name: 'PRIVACY_TEXT', message: `Your account is currently set as ` },
    { name: 'PUBLIC_TEXT', message: `Private Accounts can only be found and added with the Payment Code. Your business will be hidden from "Search by Business Name".` },
    { name: 'PRIVATE_TEXT', message: `Public accounts allow other businesses to find your account through the "Search by Business Name".` },
    { name: 'PUBLIC_BTN_LABEL', message: 'Switch to public' },
    { name: 'PRIVATE_BTN_LABEL', message: 'Switch to private' },
    { name: 'ERROR_MSG', message: 'There was an error updating your privacy settings' }
  ],

  properties: [
    {
      class: 'String',
      name: 'switchPrivacyLabel',
      expression: function(user$isPublic) {
        return user$isPublic ? this.PRIVATE_BTN_LABEL : this.PUBLIC_BTN_LABEL;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass()).addClass('card')
        .start().addClass(this.myClass('info-box'))
          .start().addClass(this.myClass('title')).add(this.TITLE).end()
          .start().addClass(this.myClass('text-box'))
            .add(this.slot(function(user$isPublic) {
              return this.E()
                .start('p').addClass(this.myClass('text'))
                  .add(this.PRIVACY_TEXT)
                  .start('span').addClass(this.myClass('privacyText')).add(user$isPublic ? 'public' : 'private').end()
                  .add('.')
                  .start('br').end()
                  .add(user$isPublic ? this.PUBLIC_TEXT : this.PRIVATE_TEXT)
                .end();
            }))
          .end()
        .end()
        .startContext({ data: this })
          .start().addClass(this.myClass('btn-box'))
            .tag(this.SWITCH_PRIVACY, {
              label$: this.switchPrivacyLabel$,
              buttonStyle: 'SECONDARY'
            })
        .endContext();
    },
  ],

  actions: [
    {
      name: 'switchPrivacy',
      code: function() {
        this.user.isPublic = ! this.user.isPublic;
        this.userDAO.put(this.user)
        .catch((err) => {
          console.error(err);
          this.notify(err.message || this.ERROR_MSG, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
