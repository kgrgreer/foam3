/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'Fonts',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS for fonts',

  cssTokens: [
    {
      name: 'fontFamily',
      value: '$font1',
      fallback: ' -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif'
    },
  ],
  css: `
    :root{
      font-size: 62.5%; /* sets default to 10px so 14px would be 1.4rem */
    }

    body {
      background: $background;
      color: $black;
      font-family: $fontFamily;
      font-size: 1.4rem;
      line-height: 1.5;
      letter-spacing: 0.014em;
    }

    /* TYPOGRAPHY */ 
    .h100{
      font-style: normal;
      font-weight: 700;
      font-size: 3.5rem;
      line-height: 1.14;
      margin: 0;
    }
    .h200{
      font-style: normal;
      font-weight: 600;
      font-size: 3rem;
      line-height: 1.1;
      margin: 0;
    }
    .h300{
      font-style: normal;
      font-weight: 600;
      font-size: 2.4rem;
      line-height: 1.17;
      margin: 0;
    }
    .h400{
      font-style: normal;
      font-weight: 600;
      font-size: 2rem;
      line-height: 1.2;
      margin: 0;
    }
    .h500{
      font-style: normal;
      font-weight: 600;
      font-size: 1.6rem;
      line-height: 1.25;
      margin: 0;
    }
    .h600{
      font-style: normal;
      font-weight: 600;
      font-size: 1.4rem;
      line-height: 1.29;
      margin: 0;
    }
    .h700{
      font-style: normal;
      font-weight: 600;
      font-size: 1.2rem;
      line-height: 1.5;
      margin: 0;
    }
    .p{
      font-style: normal;
      font-weight: normal;
      font-size: 1.4rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-light{
      font-style: normal;
      font-weight: 300;
      font-size: 1.4rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-sm{
      font-style: normal;
      font-weight: normal;
      font-size: 1.2rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-xs{
      font-style: normal;
      font-weight: normal;
      font-size: 1rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-md{
      font-style: normal;
      font-weight: normal;
      font-size: 1.6rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-lg{
      font-size: 1.8rem;
      font-style: normal;
      font-weight: normal;
      line-height: 1.78;
      margin: 0;
    }
    .p-xl{
      font-size: 2.4rem;
      font-style: normal;
      font-weight: normal;
      margin: 0;
    }
    .p-semiBold{
      line-height: 1.78;
      font-size: 1.4rem;
      font-style: normal;
      font-weight: 600;
      line-height: 1.71;
      margin: 0;
    }
    .p-bold{
      font-style: normal;
      font-weight: 700;
      font-size: 1.4rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-light{
      font-style: normal;
      font-weight: 300;
      font-size: 1.4rem;
      line-height: 1.71;
      margin: 0;
    }
    .p-legal{
      font-style: normal;
      font-weight: 500;
      font-size: 1.2rem;
      line-height: 1.17;
      margin: 0;
    }
    .p-legal-light {
      font-style: normal;
      font-weight: 400;
      font-size: 1.2rem;
      line-height: 1.17;
      margin: 0;
    }
    .p-label {
      font-style: normal;
      font-weight: 600;
      font-size: 1.2rem;
      line-height: 1.33;
      margin: 0;
    }
    .p-label-light {
      font-style: normal;
      font-weight: normal;
      font-size: 1.2rem;
      line-height: 1.33;
      margin: 0;
    }
    .p-label-lg {
      font-style: normal;
      font-weight: 600;
      font-size: 1.4rem;
      line-height: 1.43;
      margin: 0;
    }
    .p-label-lg-light {
      font-style: normal;
      font-weight: normal;
      font-size: 1.4rem;
      line-height: 1.43;
      margin: 0;
    }

    ^ .headerTitle {
      font-size: 2.4rem;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
    }
    .tite-light{
      font-size: 2.0rem;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
    }

    .enum-label {
      font-size: 1rem;
      font-weight: 500;
      letter-spacing: normal;
      line-height: 2.1em;
      text-align: center;
    }
    ^ .generic-status {
      display: inline-block;
      font-size: 1.2rem;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.67;
      letter-spacing: 0.017em;
      text-align: center;
      color: #ffffff;
    }

    /* Inherit fonts for inputs and buttons */
    input,
    button,
    textarea,
    select {
      font: inherit;
    }

    .larger-line-height {
      line-height: 1.67;
    }

    .large-title {
      text-align: center;
      font-weight: bold;
      font-size: 2.8rem;
    }

    .lighter {
      font-weight: 300;
    }

    .bolder {
      font-weight: 900;
    }

    .dao-title {
      font-size: 3.6rem;
      font-weight: 600;
    }

    /* mobile */
    @media only screen and (min-width: 321px) {
      .large-title { font-size: 3.5rem; }
    }

    /* tablet */
    @media only screen and (min-width: 768px) {
      .large-title { font-size: 6.4rem; }
    }

    /* desktop */
    @media only screen and (min-width: 960px) {
      .large-title { font-size: 8.4rem; }
    }

    .md-button {
      font-size: 3.5rem;
    }
    .md-title {
      font-weight: 500;
      font-size: 3.5rem;
      line-height: 1;
      letter-spacing: 0.5px;
    }
    .md-title-sm {
      font-size: 3rem;
      font-weight: bold;
      line-height: 1;
      letter-spacing: 0.5px;
    }
    .md-text {
      font-size: 3rem;
      font-weight: normal;
      line-height: normal;
      letter-spacing: normal;
    }
    .md-text-light {
      font-size: 3rem;
      font-weight: 300;
      line-height: normal;
      letter-spacing: normal;
    }
    .md-text-sm {
      font-size: 2.5rem;
      font-weight: 300;
    }
    .md-text-sm-bold {
      font-size: 2.5rem;
      font-weight: 500;
    }
    .md-text-xs {
      font-size: 2rem;
      font-weight: normal;
      line-height: normal;
      letter-spacing: normal;
    }
    .md-text-xs-bold {
      font-size: 2rem;
      font-weight: 500;
      line-height: normal;
      letter-spacing: normal;
    }
    .md-text-xxs {
      font-size: 1.6rem;
      font-weight: normal;
      line-height: normal;
      letter-spacing: normal;
    }
  `
});
