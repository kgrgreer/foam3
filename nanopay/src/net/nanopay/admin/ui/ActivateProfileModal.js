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
  package: 'net.nanopay.admin.ui',
  name: 'ActivateProfileModal',
  extends: 'foam.u2.Controller',

  documentation: 'Activate profile modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.ui.modal.ModalHeader',
  ],

  imports: [
    'userDAO',
    'notify',
    'closeDialog'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }
    ^ .foam-u2-ActionView {
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }
    ^ .foam-u2-ActionView-activate {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .foam-u2-ActionView-activate:hover,
    ^ .foam-u2-ActionView-activate:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Activate Profile']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to activate this profile?' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: this.title }))
        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.ACTIVATE).end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'activate',
      code: function (X) {
        var self = this;
        var toActivate = this.data;
        toActivate.status = this.AccountStatus.ACTIVE;
        
        this.userDAO.put(toActivate)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to activate profile.');
          X.closeDialog();
          self.data.copyFrom(result);
          self.notify('Profile successfully activated.', '', self.LogLevel.INFO, true);
        })
        .catch(function (err) {
          self.notify('Unable to activate profile.', '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
