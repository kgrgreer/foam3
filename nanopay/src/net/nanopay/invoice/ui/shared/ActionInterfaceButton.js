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
  package: 'net.nanopay.invoice.ui.shared',
  name: 'ActionInterfaceButton',
  extends: 'foam.u2.View',

  documentation: 'Creates interface of action buttons on invoices.',

  requires: [ 
    'foam.u2.PopupView', 
    'foam.comics.DAOCreateControllerView' 
  ],

  properties: [
    'detailActions',
    'popupMenu_',
    'openMenu',
    'data',
    {
      name: 'activePopUp',
      value: false
    }
  ],

  exports: [
    'popupMenu_',
    'detailActions'
  ],

  css: `
    ^pay-button{
      width: 157px;
      height: 40px;
      border-radius: 2px;
      background-color: #59aadd;
      color: white;
      font-size: 14px;
      font-weight: 200;
      line-height: 2.86;
      text-align: center;
      float: right;
      margin-right: 10px;
    }
    ^expand-button{
      width: 27px;
      height: 40px;
      border-radius: 2px;
      background-color: #59aadd;
      border-left: 0.5px solid #ffffff;
      float: right;
    }
    ^expand-triangle{
      width: 0; 
      height: 0; 
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
      margin-left: 9px;    
      position: relative;
      top: -20px;
    }
    ^top-action-buttons{
      float: right;
    }
    ^ .optionsDropDown {
      padding: 0;
      z-index: 1;
      width: 157px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
      text-align: left;
    }
    ^ .optionsDropDown > div {
      width: 139px;
      height: 30px;
      padding-left: 18px;
      font-size: 14px;
      font-weight: 300;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 30px;
    }
    ^ .optionsDropDown > div:hover {
      background-color: #59aadd;
      color: white;
      cursor: pointer;
    }
    ^ .foam-u2-ActionView{
      position: absolute;
      width: 75px;
      height: 35px;
      z-index: 1;
      opacity: 0.01;
    }
    ^ .foam-u2-ActionView-PopUp{
      position: relative;
      width: 30px;
      height: 40px;
    }
    ^ .foam-u2-ActionView-mainAction{
      opacity: 0.01;
      z-index: 1;
      position: absolute;
      height: 35px;
      width: 125px;
      right: 185px;
    }
    .foam-u2-ActionView-backAction{
      position: relative;
      top: 40;
      width: 135px;
      height: 40px;
      border-radius: 2px;
      border: 1px solid lightgrey;
      // background-color: rgba(164, 179, 184, 0.1);
    }
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
          .start().addClass(this.myClass('top-action-buttons'))
          // .start({  
          //   class: 'net.nanopay.ui.ActionButton', 
          //   data: {
          //     image: 'images/approve.png', 
          //     text: 'Approve',
          //     data: this.data,
          //     title: 'Approve'
          //   }
          // }).addClass('import-button').add(this.APPROVE_MODAL).end()
          // .start({
          //   class: 'net.nanopay.ui.ActionButton', 
          //   data: {
          //     image: 'images/reject.png', 
          //     text: 'Reject',
          //     data: this.data,
          //     title: 'Dispute'
          //   }
          // }).addClass('import-button').add(this.DISPUTE_MODAL).end()
          // .start(this.EMAIL_MODAL).addClass('import-button').end()
          // .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-assign.png', text: 'Assign'}}).addClass('import-button').end()
          .start({
            class: 'net.nanopay.ui.ActionButton', 
            data: {
              image: 'images/ic-export.png', 
              text: 'Export',
              data: this.data,
              title: 'Export'
            }
          }).addClass('import-button').add(this.EXPORT_MODAL).end()
          // .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-print.png', text: 'Print'}}).addClass('import-button').end()
          .start().addClass(this.myClass('pay-button')).add(this.detailActions.buttonLabel)
          .startContext({ data: this }).add(this.MAIN_ACTION)
            .start().addClass(this.myClass('expand-button')).add(this.POP_UP)
              .start().addClass(this.myClass('expand-triangle')).end()
            .end()   
            .start('span', null, this.popupMenu_$)      
            .end()
          .end()
          .end()
        .end()
    }
  ],


  actions: [
    {
      name: 'popUp',
      isAvailable: function(activePopUp){
        return ! activePopUp;
      },
      code: function(X) {
        this.activePopUp = true;
        var self = this;
        var p = this.PopupView.create({
          width: 157,
          left: -117,
          top: 30
        }, X);
        p.onunload.sub(function() { self.activePopUp = false; });
        p.addClass('optionsDropDown')
          .start('div').add(this.detailActions.subMenu1)
            .on('click', this.detailActions.subMenuAction1)
          .end()
          .call(function(){
            if(self.detailActions.subMenu2){
              p.start().add(self.detailActions.subMenu2)
                .on('click', self.detailActions.subMenuAction2)
              .end()
            }
          })
        this.popupMenu_.add(p)
      }
    },
    {
      name: 'mainAction',
      code: function(){
        this.detailActions.buttonAction()
      }
    },
    {
      name: 'emailModal',
      icon: 'images/ic-email.png',
      code: function(X){
        X.ctrl.add(foam.u2.dialog.Popup.create().tag({class: 'net.nanopay.ui.modal.EmailModal'}));
      }
    },
    {
      name: 'approveModal',
      code: function(X){
        X.ctrl.add(
          foam.u2.dialog.Popup.create(null, X)
            .tag({ 
              class: 'net.nanopay.invoice.ui.modal.ApproveModal', 
              invoice: X.data.data
            })
        );
      }
    },
    {
      name: 'disputeModal',
      code: function(X){
        X.ctrl.add(
          foam.u2.dialog.Popup.create(null, X)
            .tag({ 
              class: 'net.nanopay.invoice.ui.modal.DisputeModal', 
              invoice: X.data.data
            })
        );
      }
    },
    {
      name: 'exportModal',
      code: function(X){
        X.ctrl.add(
          foam.u2.dialog.Popup.create(null, X)
            .tag({ 
              class: 'net.nanopay.ui.modal.ExportModal', 
              exportObj: X.data.data
            })
        );
      }
    }
  ]
});