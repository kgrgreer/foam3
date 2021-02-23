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
  package: 'net.nanopay.tx.ui.exposure',
  name: 'ValueCard',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      box-sizing: border-box;
      flex: 1;
      height: 188px;

      padding: 24px 16px;

      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;

      display: inline-block;
      margin-right: 16px;
    }

    ^:last-child {
      margin-right: 0;
    }

    ^ p {
      margin: 0;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 600;
      line-height: 1.5;
    }

    ^title {
      font-size: 12px;
      margin-bottom: 32px !important;
    }

    ^value {
      font-size: 28px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'title',
      value: 'PLACEHOLDER TITLE'
    },
    {
      class: 'String',
      name: 'value',
      value: 'PLACEHOLDER VALUE'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.title$).end()
        .start('p').addClass(this.myClass('value')).add(this.value$).end();
    }
  ]
});
