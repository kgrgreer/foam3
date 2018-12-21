foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Placeholder',
  extends: 'foam.u2.View',

  documentation: "Placeholder with image & text. Use to populate an empty area if data doesn't exist. ",

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
           position: relative;
           bottom: 700;
           text-align: center;
           display: none;
           margin: 50px 0;
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
