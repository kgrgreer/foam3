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
      border-radius: 3px;
      padding: 4px;
      width: 4ch;
    }
    ^selected {
      background-color: /*%PRIMARY3%*/ #406dea;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
  `
});
