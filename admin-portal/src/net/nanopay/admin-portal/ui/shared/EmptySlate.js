foam.CLASS({
  package: 'net.nanopay.admin.ui.shared',
  name: 'EmptySlate',
  extends: 'foam.u2.View',

  documentation: 'Empty slate',

  requires: [
    'foam.dao.FnSink',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .empty-slate-text{
          display: inline-block;
          text-align: center;
          font-family: Roboto;
          letter-spacing: 0.2px;
          color: #093649;
          position: relative;
          top: 30;
        }

        ^empty-slate-container{
          text-align: center;
          width: 95%;
          height: 149px;
          background: white;
          position: relative;
          vertical-align: top;
          border-radius: 4px;
          overflow: auto;
          align: center;
          display: none;
          margin: auto;
          margin-top: 30px;
        }

        .show{
          display: block;
        }

        ^empty-slate-button{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          background-color: #5E91CB;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: #ffffff;
          margin: auto;
          display: block;
          margin-top: 55px;
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
    'buttonText',
    'show'
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.onDAOUpdate()
      var view = this;
      var sub = this.dao$proxy.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onunload.sub(function(){ sub.detach(); });

      this
        .start().addClass(this.myClass('empty-slate-container')).enableClass('show', this.show$)
          .start().addClass('empty-slate-text').add(this.message).end()
          .call(function() {
              if ( view.buttonText ) {
                this.start()
                  .addClass(view.myClass('empty-slate-button'))
                  .add(view.buttonText)
                  .on('click', this.signIn)
                .end();
              }
            })
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
