/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that can be included into the top level controller of foam app. Implement to foam class to use.',

  css: `
    :root{
      font-size: 62.5%; /* sets default to 10px so 14px would be 1.4rem */
    }

    body {
      background: /*%GREY5%*/ #f5f7fa;
      color: /*%BLACK%*/ #1E1F21;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 1.4rem;
      letter-spacing: 0.014em;
      margin: 0;
      overscroll-behavior: none;
    }

    blockquote{
      border-left-color: #ccc;
      border-left-style: solid;
      margin: 0;
      margin-left: 2ch;
      padding-left: 1ch;
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
    .p{
      font-style: normal;
      font-weight: normal;
      font-size: 1.4rem;
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
    .p-semiBold{
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
    .p-label{
      font-style: normal;
      font-weight: 600;
      font-size: 1.2rem;
      line-height: 1.17;
      margin: 0;
    }

    /* SHADOWS */
    .base-shadow {
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
    } 

    .md-shadow {
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    .lg-shadow {
      box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
    }

    .xl-shadow {
      box-shadow: 0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04);
    }

    .2xl-shadow {
      box-shadow: 0px 25px 50px rgba(0, 0, 0, 0.25);
    }

    .inner-shadow {
      box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.06);
    }

    .New {
      width: 35px;
      height: 20px;
      border-radius: 100px;
      background-color: #eedb5f;
    }
    .Updated {
      width: 60px;
      height: 20px;
      border-radius: 100px;
      background-color: /*%BLACK%*/ #1e1f21;
    }
    .Open {
      width: 49px;
      height: 20px;
      border-radius: 100px;
      background-color: #ee5f71;
    }
    .Pending {
      width: 55px;
      height: 20px;
      border-radius: 100px;
      background-color: #59a5d5;
    }
    .Solved {
      width: 50px;
      height: 20px;
      border-radius: 100px;
      background-color: #a4b3b8;
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
    textarea:focus{
      outline: none;
    }
    input:focus{
      outline: none;
    }
    .horizontal-flip {
    -moz-transform: scale(-1, 1);
    -webkit-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    transform: scale(-1, 1);
    margin-right: 10px;
  }
  .inline-block {
    display: inline-block;
  }

  /* Box sizing rules */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
  ul[role='list'],
  ol[role='list'] {
    list-style: none;
  }

  /* Set core root defaults */
  html:focus-within {
    scroll-behavior: smooth;
  }

  /* Set core body defaults */
  body {
    min-height: 100vh;
    line-height: 1.5;
  }

  /* A elements that don't have a class get default styles */
  a:not([class]) {
    text-decoration-skip-ink: auto;
  }

  /* Make images easier to work with */
  img,
  picture {
    max-width: 100%;
    display: block;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
  @media (prefers-reduced-motion: reduce) {
    html:focus-within {
      scroll-behavior: auto;
    }
    
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  .larger-line-height {
    line-height: 1.67;
  }

  .large-title {
    text-align: center;
    font-weight: bold;
    font-size: 2.8rem;
  }

  .flexCenter {
    display: flex;
    justify-content: center;
    align-items: center;
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
  `
});
