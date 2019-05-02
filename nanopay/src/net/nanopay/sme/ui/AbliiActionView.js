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
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^ img {
      margin-right: 4px;
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
      background-color: %SECONDARYCOLOR%;
      color: white;
      border: 1px solid #4a33f4;
    }

    ^primary:hover:not(:disabled) {
      border: 1px solid #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^primary:focus:not(:hover) {
      border-color: #23186c;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary:disabled {
      border: 1px solid %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }


    /*
     * Primary destructive
     */

    ^primary-destructive {
      background-color: %DESTRUCTIVECOLOR%;
      border: 1px solid %DESTRUCTIVECOLOR%;
    }

    ^primary-destructive:hover {
      background-color: %DESTRUCTIVEHOVERCOLOR%;
      border-color: #a61414;
    }

    ^primary-destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^primary-destructive:disabled {
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
      border-color: #ed8e8d;
    }


    /*
     * Secondary
     */

    ^secondary {
      border: 1px solid %SECONDARYCOLOR%;
      background-color: white;
      color: %SECONDARYCOLOR%;
    }

    ^secondary:hover {
      border-color: %SECONDARYHOVERCOLOR%;
      background-color: white;
      color: %SECONDARYHOVERCOLOR%;
    }

    ^secondary:focus:not(:hover) {
      border-color: #432de7;
      color: %SECONDARYHOVERCOLOR%;
    }

    ^secondary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      color: %SECONDARYDISABLEDCOLOR%;
    }


    /*
     * Secondary destructive
     */

    ^secondary-destructive {
      border: 1px solid %DESTRUCTIVECOLOR%;
      background-color: white;
      color: %DESTRUCTIVECOLOR%;
    }

    ^secondary-destructive:hover {
      border-color: %DESTRUCTIVEHOVERCOLOR%;
      background-color: white;
      color: %DESTRUCTIVEHOVERCOLOR%;
    }

    ^secondary-destructive:disabled {
      border-color: %DESTRUCTIVEDISABLEDCOLOR%;
      color: %DESTRUCTIVEDISABLEDCOLOR%;
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
      color: %SECONDARYCOLOR%;
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
