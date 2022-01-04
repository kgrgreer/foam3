/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateChoiceView',
  extends: 'foam.u2.view.DayChoiceView',
  css: `
    ^ {
      background-color: /*%WHITE%*/ #ffffff;
      border: 1px /*%WHITE%*/ #ffffff;
      border-radius: 8px;
      box-sizing: content-box;
      font-weight: normal;
      padding: 4px;
      transition: all 0.2s ease;
      text-align: center;
      width: 1.5em;
    }
    ^:hover {
      cursor: pointer;
    }
    ^selected {
      background-color: /*%PRIMARY3%*/ #406dea;
      color: /*%WHITE%*/ #ffffff;
      font-weight: bold;
    }
  `
});
