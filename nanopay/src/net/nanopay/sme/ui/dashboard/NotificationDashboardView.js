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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'NotificationDashboardView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'foam.core.Currency',
    'foam.nanos.notification.NotificationCitationView',
  ],

  imports: [
    'invoiceDAO',
    'currencyDAO',
    'user'
  ],

  css: `
    ^ {
      margin-bottom: 4px;
      border-radius: 4px;
      padding: 8px 0;
    }
    ^message {
      margin-bottom: 8px;
    }
    ^ .date {
      color: #8e9090;
      margin-top: 8px;
    }
  `,

  properties: [
    'data',
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    },
    {
      name: 'bodyMsg',
      class: 'String'
    },
    {
      name: 'date',
      class: 'String'
    },
    {
      name: 'icon',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    }
  ],

  methods: [
    function initE() {
      this.bodyMsg = this.data.body;
      this.date = this.data.created ?
          this.spliceDateFormatter(this.data.created.toLocaleDateString(foam.locale)) : '';

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('message'))
          .add(this.bodyMsg$)
        .end()
        .start()
          .addClass('date')
          .add(this.date$)
        .end();
      },

    function spliceDateFormatter(dateString) {
      let splitDate = dateString.split('-');
      let date = dateString;
      if ( splitDate.length === 3 ) {
        switch ( parseInt(splitDate[1]) ) {
          case 1:
            date = 'January';
            break;
          case 2:
            date = 'February';
            break;
          case 3:
            date = 'March';
            break;
          case 4:
            date = 'April';
            break;
          case 5:
            date = 'May';
            break;
          case 6:
            date = 'June';
            break;
          case 7:
            date = 'July';
            break;
          case 8:
            date = 'August';
            break;
          case 9:
            date = 'September';
            break;
          case 10:
            date = 'October';
            break;
          case 11:
            date = 'November';
            break;
          case 12:
            date = 'December';
            break;
          default:
            return splitDate;
        }
        return `${date} ${splitDate[2]}, ${splitDate[0]}`;
      }
      return date;
    }
  ]
});
