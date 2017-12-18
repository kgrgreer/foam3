foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionView',
  extends: 'foam.u2.UnstyledActionView',

  css: `
    ^ {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      text-align: center;
      display: inline-block;
      cursor: pointer;
      font-size: 12px;
      padding: 0;
    }

    ^unavailable {
      visibility: hidden;
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
    
    ^:disabled { filter: grayscale(80%); }
  `
});
