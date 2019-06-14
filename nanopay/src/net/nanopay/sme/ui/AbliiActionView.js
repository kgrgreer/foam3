foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AbliiActionView',
  extends: 'foam.u2.ActionView',

  documentation: 'Style overrides for Ablii buttons.',

  inheritCSS: false,
  css: `
    ^ {
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

    ^ img {
      margin-right: 8px;
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
      background-color: %PRIMARY3%;
      color: white;
      border: 1px solid #4a33f4;
    }

    ^primary:hover:not(:disabled) {
      border: 1px solid #294798;
      background-color: %PRIMARY2%;
    }

    ^primary:focus:not(:hover) {
      border-color: #23186c;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border: 1px solid %PRIMARY5%;
      background-color: %PRIMARY5%;
    }


    /*
     * Primary destructive
     */

    ^primary-destructive {
      background-color: %DESTRUCTIVE3%;
      border: 1px solid %DESTRUCTIVE3%;
      color: white;
    }

    ^primary-destructive:hover {
      background-color: %DESTRUCTIVE2%;
      border-color: #a61414;
    }

    ^primary-destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: %DESTRUCTIVE5%;
      border-color: #ed8e8d;
    }


    /*
     * Secondary
     */

    ^secondary {
      border: 1px solid %PRIMARY3%;
      background-color: white;
      color: %PRIMARY3%;
    }

    ^secondary:hover {
      border-color: %PRIMARY2%;
      background-color: white;
      color: %PRIMARY2%;
    }

    ^secondary:focus:not(:hover) {
      border-color: #432de7;
      color: %PRIMARY2%;
    }

    ^secondary:disabled {
      border-color: %PRIMARY5%;
      color: %PRIMARY5%;
    }


    /*
     * Secondary destructive
     */

    ^secondary-destructive {
      border: 1px solid %DESTRUCTIVE3%;
      background-color: white;
      color: %DESTRUCTIVE3%;
    }

    ^secondary-destructive:hover {
      border-color: %DESTRUCTIVE2%;
      background-color: white;
      color: %DESTRUCTIVE2%;
    }

    ^secondary-destructive:disabled {
      border-color: %DESTRUCTIVE5%;
      color: %DESTRUCTIVE5%;
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
      color: %PRIMARY3%;
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
