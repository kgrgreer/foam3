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
      background-color: %SECONDARYCOLOR%;
      color: white;
      outline: none;
      border: 1px solid #4a33f4;
      padding: 9px 16px;
    }

    ^ + ^ {
      margin-left: 8px;
    }

    ^ img {
      margin-right: 4px;
    }

    ^:focus:not(:hover) {
      border-width: 2px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
      padding: 8px 15px;
    }

    ^:hover:not(:disabled) {
      cursor: pointer;
    }

    ^:hover:not(:disabled):not(^secondary):not(^secondary-destructive):not(^destructive) {
      border: 1px solid #294798;
      background-color: %SECONDARYHOVERCOLOR%;
    }

    ^:disabled:not(^secondary):not(^secondary-destructive):not(^destructive) {
      border: 1px solid %SECONDARYDISABLEDCOLOR%;
      background-color: %SECONDARYDISABLEDCOLOR%;
    }

    ^unavailable {
      display: none;
    }

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

    ^secondary:disabled {
      border-color: %SECONDARYDISABLEDCOLOR%;
      color: %SECONDARYDISABLEDCOLOR%;
    }

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

    ^destructive {
      background-color: %DESTRUCTIVECOLOR%;
      border: 1px solid %DESTRUCTIVECOLOR%;
    }

    ^destructive:hover {
      background-color: %DESTRUCTIVEHOVERCOLOR%;
      border-color: #a61414;
    }

    ^destructive:focus {
      border: 2px solid #a61414;
      padding: 7px 15px;
      box-shadow: 0 1px 2px 0 rgba(22, 29, 37, 0.1), inset 0 1px 0 1px rgba(255, 255, 255, 0.06);
    }

    ^destructive:disabled {
      background-color: %DESTRUCTIVEDISABLEDCOLOR%;
      border-color: #ed8e8d;
    }

    ^tertiary {
      background: none;
      border: none;
      box-shadow: none;
      color: #8e9090;
    }

    ^tertiary:hover {
      color: %SECONDARYCOLOR%;
    }

    /* TODO: Support buttons of different sizes */

    ^small {
      font-size: 10px;
      padding: 8px 16px;
    }

    ^small:focus:not(:hover) {
      padding: 7px 15px;
    }

    ^medium {
      font-size: 14px;
      padding: 9px 16px;
    }

    ^medium:focus:not(:hover) {
      padding: 8px 15px;
    }

    ^large {
      font-size: 16px;
      padding: 13px 16px;
    }

    ^large:focus:not(:hover) {
      padding: 12px 15px;
    }
  `
});
