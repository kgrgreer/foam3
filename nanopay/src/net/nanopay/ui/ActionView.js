foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionView',
  extends: 'foam.u2.UnstyledActionView',

  css: `
    ^ {
      width: 135px;
      height: 40px;
      border-radius: 4px;
      text-align: center;
      display: inline-block;
      font-size: 12px;
      padding: 0;
      background-color: %SECONDARYCOLOR%;
      color: white;
    }

    ^:hover:not(:disabled) {
      background-color: %SECONDARYHOVERCOLOR%;
      cursor: pointer;
    }

    ^unavailable {
      display: none;
    }

    ^ img {
      vertical-align: middle;
    }

    ^.material-icons {
      cursor: pointer;
    }

    ^back {
      display: none;
    }

    ^forward {
      display: none;
    }

    ^:disabled {
      background-color: %SECONDARYDISABLEDCOLOR%;
    }
  `
});
