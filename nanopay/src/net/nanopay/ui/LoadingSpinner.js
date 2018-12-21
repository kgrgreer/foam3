foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'LoadingSpinner',
  extends: 'foam.u2.View',

  documentation: 'Small view that just shows a loading spinner',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          position: relative;
        }

        ^.hidden {
          display: none;
        }

        ^ img {
          -webkit-animation:spin 3s linear infinite;
          -moz-animation:spin 3s linear infinite;
          animation:spin 3s linear infinite;
        }
        @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
        @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
        @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start({class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg'}).end();
    },

    function show() {
      this.isHidden = false;
    },

    function hide() {
      this.isHidden = true;
    }
  ]
});
