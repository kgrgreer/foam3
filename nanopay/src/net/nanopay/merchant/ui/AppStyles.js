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
  package: 'net.nanopay.merchant.ui',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that is used through out the Nanopay platform. Please Reference when styling views. Implements to class use.',

  css: `
    body, html {
      height: 100%;
    }
    body {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      background-color: /*%BLACK%*/ #1e1f21;
      margin: 0;
      min-width: 320px;
      min-height: 480px;
      overflow: hidden;
      -moz-user-select: none;
      -ms-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    button {
      padding: 0;
      border: none;
      background: none;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.88;
      text-align: center;
      color: #ffffff;
    }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
    }
    .stack-wrapper {
      padding-top: 56px;
    }
    .sidenav {
      display: none;
      height: 100%;
      width: 250px;
      position: fixed;
      z-index: 1;
      top: 0;
      left: 0;
      background-color: #FFFFFF;
      overflow-x: hidden;
      box-shadow: 10px 8px 10px -5px rgba(0, 0, 0, 0.2),
        0px 16px 24px 2px rgba(0, 0, 0, 0.14),
        0px 6px 30px 5px rgba(0, 0, 0, 0.12);
    }
    .sidenav.open {
      display: block;
      border-radius: 0px;
    }
    .toolbar {
      width: 100%;
      height: 56px;
      background-color: /*%BLACK%*/ #1e1f21;
      -webkit-box-shadow: none;
      box-shadow: none;
      position: fixed;
      top: 0;
    }
    .toolbar-icon {
      height: 56px;
      padding-left: 20px;
      padding-right: 20px;
      float: left;
    }
    .toolbar-icon.about {
      height: 56px;
      padding-left: 20px;
      padding-right: 20px;
      float: right;
    }
    .toolbar-title {
      font-size: 16px;
      line-height: 56px;
      position: absolute;
      margin-left: 64px;
    }
    .sidenav-list-item {
      height: 90px;
      border-bottom: 1px solid #e5e5e5;
      cursor: pointer;
    }
    .sidenav-list-item.selected {
      background-color: #f1f1f1;
    }
    .sidenav-list-item a {
      font-size: 16px;
      font-weight: 500;
      color: #595959;
      line-height: 90px;
      text-decoration: none;
    }
    .sidenav-list-item.about {
      height: 56px;
      width: 250px;
      position: fixed;
      bottom: 0px;
    }
    .sidenav-list-item.about a {
      line-height: 56px;
    }
    .sidenav-list-icon i {
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }
    .sidenav-list-icon img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      vertical-align: middle;
      padding-left: 20px;
      padding-right: 10px;
    }
    .sidenav-list-item.back {
      height: 56px;
      background-color: #26A96C;
    }
    .sidenav-list-item.back a {
      color: #FFFFFF;
      line-height: 56px;
      text-decoration: none;
    }
    .sidenav-list-icon.material-icons {
      height: 100%;
      padding-left: 25px;
      padding-right: 20px;
      float: left;
      line-height: 56px;
    }
    .net-nanopay-ui-ToggleSwitch {
      float: right;
      margin-top: 33px;
      margin-bottom: 33px;
      margin-right: 43px;
    }
  `
});
