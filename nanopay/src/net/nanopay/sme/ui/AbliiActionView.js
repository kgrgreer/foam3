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
  name: 'AbliiActionView',
  extends: 'foam.u2.ActionView',

  documentation: 'Style overrides for Ablii buttons.',

  inheritCSS: false,
  css: `
    ^ {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      border-radius: 4px;
      text-align: center;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      outline: none;
      border: 1px solid transparent;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
    }

    ^unavailable {
      display: none;
    }


    /*
     * Primary
     */

    ^primary {
      background-color: /*%PRIMARY3%*/ #406dea;
      color: white;
      border: 1px solid #4a33f4;
    }

    ^primary:hover:not(:disabled) {
      border: 1px solid #294798;
      background-color: /*%PRIMARY2%*/ #144794;
    }

    ^primary:focus:not(:hover) {
      border-color: #23186c;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border: 1px solid /*%PRIMARY4%*/ #a7beff;
      background-color: /*%PRIMARY4%*/ #a7beff;
    }


    /*
     * Primary destructive
     */

    ^primary-destructive {
      background-color: /*%DESTRUCTIVE3%*/ #d9170e;
      border: 1px solid /*%DESTRUCTIVE3%*/ #d9170e;
      color: white;
    }

    ^primary-destructive:hover {
      background-color: /*%DESTRUCTIVE2%*/ #a61414;
      border-color: #a61414;
    }

    ^primary-destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: /*%DESTRUCTIVE5%*/ #fbedec;
      border-color: #ed8e8d;
    }


    /*
     * Secondary
     */

    ^secondary {
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      background-color: white;
      color: /*%PRIMARY3%*/ #406dea;
    }

    ^secondary:hover {
      border-color: /*%PRIMARY2%*/ #144794;
      background-color: white;
      color: /*%PRIMARY2%*/ #144794;
    }

    ^secondary:focus:not(:hover) {
      border-color: #432de7;
      color: /*%PRIMARY2%*/ #144794;
    }

    ^secondary:disabled {
      border-color: /*%PRIMARY4%*/ #a7beff;
      color: /*%PRIMARY4%*/ #a7beff;
    }


    /*
     * Secondary destructive
     */

    ^secondary-destructive {
      border: 1px solid /*%DESTRUCTIVE3%*/ #d9170e;
      background-color: white;
      color: /*%DESTRUCTIVE3%*/ #d9170e;
    }

    ^secondary-destructive:hover {
      border-color: /*%DESTRUCTIVE2%*/ #a61414;
      background-color: white;
      color: /*%DESTRUCTIVE2%*/ #a61414;
    }

    ^secondary-destructive:disabled {
      border-color: /*%DESTRUCTIVE5%*/ #fbedec;
      color: /*%DESTRUCTIVE5%*/ #fbedec;
    }


    /*
     * Tertiary
     */

    ^tertiary {
      background: none;
      border: 1px solid transparent;
      box-shadow: none;
      color: #8e9090;
    }

    ^tertiary:hover {
      color: /*%PRIMARY3%*/ #406dea;
    }

    ^tertiary:focus:not(:hover) {
      border-color: #4a33f4;
    }


    /*
     * Sizes
     */

    ^small {
      font-size: 10px;
      padding: 8px 16px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^large {
      font-size: 16px;
      padding: 13px 16px;
    }
  `
});
