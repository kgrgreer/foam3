/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
