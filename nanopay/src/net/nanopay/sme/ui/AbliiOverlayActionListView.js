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
  name: 'AbliiOverlayActionListView',
  extends: 'foam.u2.view.OverlayActionListView',

  css: `
    ^ { 
      padding: 13px 0px;
      right: 15;
    }
    
    ^action {
      border-radius: 0px;
      padding: 8px 24px;
      font-size: 16px;
      color: /*%BLACK%*/ #1e1f21;
      float: right;
    }

    ^action[disabled] {
      color: #e2e2e3;
    }

    ^action:hover:not([disabled]) {
      background-color: #f3f2ff !important;
      color: #604aff;
    }
  `,

  properties: [
    {
      type: 'URL',
      name: 'activeImageURL',
      value: 'images/Icon_More_Active_Ablii.svg'
    },
    {
      type: 'URL',
      name: 'hoverImageURL',
      value: 'images/Icon_More_Hover_Ablii.svg'
    }
  ]
});
