foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ExpandContainer',
  documentation: 'Provide an expandable div which take content to display inside',

  css:`
  
  `,

  methods: [
    function initE(){
      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start().addClass('boxTitle')
          .add(this.title)
        .end()
        .start()
          .addClass('expand-BTN').enableClass('close-BTN', this.expandBox1$, true)
          .add(this.expandBox1$.map(function(e) { return e ? "Expand" : "Close"; }))
          .enableClass('', self.expandBox1 = (self.expandBox1 ? false : true))
          .on('click', function(){ self.expandBox1 = ( self.expandBox1 ? false : true ) })
        .end()

        .start().addClass('expand-Container').enableClass("expandTrue", self.expandBox1$)
        .end()
      .end();
    }
  ]
});