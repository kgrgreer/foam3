foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'RadioView',
  extends: 'foam.u2.view.RadioView',

  documentation: 'Radio view styled with NANOPAY colors and design. Functionality remains the same.',

  css: `
    ^ {
      margin: 11px 0;
    }

    ^ input[type="radio"] {
      display: none;
    }

    ^ label {
      position: relative;
      padding-left: 32px;
    }

    ^ label span::before,
    ^ label span::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
    }

    ^ label span:hover {
      cursor: pointer;
    }

    ^ label span::before {
      left: 0;
      width: 15px;
      height: 15px;
      border: solid 1px #2d4088;
      border-radius: 7.5px;
      box-sizing: border-box;
    }

    ^ label span::after {
      left: 5px;
      width: 5px;
      height: 5px;
      border-radius: 2.5px;
      background-color: transaparent;
    }

    ^ input[type="radio"]:checked + label span::after {
      background-color: #2d4088;
    }

    ^ label span {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
    }
  `
});
