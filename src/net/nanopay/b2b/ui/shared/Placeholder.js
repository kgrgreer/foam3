foam.CLASS({
  package: 'net.nanopay.b2b.ui.shared',
  name: 'Placeholder',
  extends: 'foam.u2.View',

  documentation: 'Placeholder for expenses/sales',

  requires: [
    'foam.dao.FnSink',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .placeholder-text{
          width: 375px;
          display: inline-block;
          margin-left: 40px;
          text-align: left;
          color: #09364A;
          position: relative;
          top: -15;
        }
        ^placeholder-container{
           text-align: center;
           display: none;
        }
        .show{
          display: block;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    'message',
    'image',
    'show'
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.onDAOUpdate()
      var sub = this.dao$proxy.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onunload.sub(function(){ sub.detach(); });

      this
        .start().addClass(this.myClass('placeholder-container')).enableClass('show', this.show$)
          .start({ class:'foam.u2.tag.Image', data: this.image }).end()
          .start().addClass('placeholder-text').add(this.message).end()
        .end();
    }
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        
        this.dao.limit(1).select().then(function(a){ 
          self.show = a.array.length == 0;
        });
      }
    }
  ],
});
