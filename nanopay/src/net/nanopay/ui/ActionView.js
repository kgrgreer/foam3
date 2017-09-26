foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ActionView',
  extends: 'foam.u2.UnstyledActionView',

  documentation: function() {`
    ActionView for Nanopay platform. 
    A button View for triggering Actions.

    Icon Fonts
    If using icon-fonts a css stylesheet link to the fonts is required in index.html.
    The default of foam.core.Action.js is 'Material Icons' supported by the following
    link: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
  `},

  axioms: [
    foam.u2.CSS.create({code: function() {/*
      ^ {
        width: 135px;
        height: 40px;
        border-radius: 2px;
        text-align: center;
        display: inline-block;
        cursor: pointer;
        margin: 0px 5px 0px 0px;
        font-size: 14px;
        padding: 0;
      }

      ^unavailable {
        visibility: hidden;
      }

      ^ img {
        vertical-align: middle;
      }

      ^:disabled { filter: grayscale(80%); }

      ^.material-icons {
        cursor: pointer;
      }
      ^back {
        display: none;
      }
      ^forward {
        display: none;
      }
    */}})
  ]
});
