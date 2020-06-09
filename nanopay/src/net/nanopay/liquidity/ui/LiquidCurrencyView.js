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
  package: 'net.nanopay.liquidity.ui',
  name: 'LiquidCurrencyView',
  extends: 'foam.u2.view.ModeAltView',

  css: `
    ^ .foam-u2-view-DualView-viewb {
      min-height: 1.2em;
    }
  `,

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.TableCellFormatterReadView' }
    },
    {
      name: 'writeView',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.IntView', onKey: true },
        viewb: { class: 'foam.u2.view.TableCellFormatterReadView' }
      }
    }
  ],
});
