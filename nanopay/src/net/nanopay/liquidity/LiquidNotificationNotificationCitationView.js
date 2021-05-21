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
  package: 'net.nanopay.liquidity',
  name: 'LiquidNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  imports: [
    'user',
    'userDAO'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  properties: [
    'userSummary',
    {
      class: 'Boolean',
      name: 'truncated',
      documentation: 'determines whether the body content is truncated or not.'
    },
    'classification',
    {
      name: 'showClassification',
      class: 'Boolean',
      value: false
    }
  ],

  css: `
    ^ {
      line-height: 17px;
      width: 100%;
    }
    ^ .userSummary {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1e1f21;
      margin-left: 16px;
    }
    ^ .created {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #5e6061;
      margin-left: 16px;
    }
    ^ .classification {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      padding-left: 8px;
      padding-right: 8px;
      min-width: 84px;
      height: 20px;
      border-radius: 3px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0);
      background-color: #e7eaec;
      color: #5e6061;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .description {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #1e1f21;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .userSummaryDiv {
      position: relative;
      top: 8;
      display: inline-block;
     }
  `,

  methods: [
    function initE() {
      //this.SUPER();

      this.created = this.data.created.toUTCString();
      this.classification = this.data.notificationType;
      this.showClassification = !! this.data.notificationType;

      this.description = this.data.body;
      if ( this.description !== '' && this.description.length > 70 ) {
        this.description = this.description.substr(0, 70-1) + '...';
      }

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('userSummaryDiv')
            .start().addClass('userSummary')
              .add(this.userSummary$)
            .end()
            .start().addClass('created')
              .add(this.created$)
            .end()
          .end()
          .start().addClass('classification')
            .show(this.showClassification$).add(this.classification$)
          .end()
          .start().addClass('description')
            .add(this.description$)
          .end()
        .end();

      this.userDAO.find(this.data.userId).then(user => this.userSummary = user.toSummary());
    }
  ],

  listeners: [
    function toggleTruncation() {
      this.truncated = ! this.truncated;
    }
  ]
});
