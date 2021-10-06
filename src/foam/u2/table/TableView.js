/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.table',
  name: 'TableView',
  extends: 'foam.u2.table.UnstyledTableView',

  css: `
    ^ {
      border-spacing: 0px;
      overflow-x: unset;
      width: 100%;
    }

    ^tbody {
      display: flow-root;
    }

    ^full-height{
      height: 100%;
    }

    ^table-wrapper{
      /*Scroll*/
      flex: 1;
      max-height: 100%;
      position: relative;
      overflow: auto;
      overscroll-behavior: contain;
      scroll-behavior: smooth;
    }

    ^tr {
      background: /*%WHITE%*/ white;
      display: flex;
      height: 48px;
      justify-content: space-between;
    }

    ^tbody ^tr:hover {
      background: /*%GREY5%*/ #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
    }

    ^thead {
      overflow: hidden;
      overflow-x: auto;
      position: sticky;
      top: 0;
    }

    ^thead > ^tr {
      border-bottom: 2px solid /*%GREY4%*/ #DADDE2;
      box-sizing: border-box;
      border-radius: 4px 4px 0 0;
    }

    ^td,
    ^th {
      align-self: center;
      box-sizing: border-box;
      color: /*%BLACK%*/ #1e1f21;
      display: block;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      padding-left: 16px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 40px; /* So when the table's width decreases, columns aren't hidden completely */
    }

    ^th:not(:last-child) > img {
      margin-left: 8px;
    }

    ^th:hover {
      cursor: pointer;
    }

    /**
     * OTHER
     */
    ^selected {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^td .foam-u2-ActionView {
      padding: 4px 12px;
    }

    ^row-group{
      background: /*%GREY5%*/ #F5F7FA;
    }

    /* PAGINATION */
    ^nav{
      align-items: center;
      background: /*%WHITE%*/ white;
      border-radius: 0 0 4px 4px;
      border-top: 1px solid /*%GREY4%*/ #DADDE2;
      box-sizing: border-box;
      gap: 8px;
      justify-content: flex-end;
      max-height: 56px;
      padding: 16px 24px;
      width: 100%;
    }
    ^buttons svg{
      width: 1em;
      height: 1em;
    }
    ^counters > *:focus {
      border: 0px;
      border-radius: 0px;
      padding: 0px;
      height: auto;
      border-bottom: 2px solid /*%PRIMARY3%*/ #406DEA;
    }
  `,
});
