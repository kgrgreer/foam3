foam.CLASS({
   package: 'net.nanopay.admin.ui',
   name: 'TransactionAltView',
   extends: 'foam.u2.view.AltView',

   requires: [
     'foam.nanos.menu.Menu',
     'foam.u2.view.TableView'
   ],

   css: `
     .foam-u2-view-TreeView {
       width: 962px;
     }
   `,

   imports: [
     'transactionDAO',
     'stack'
   ],

   exports: [
     'dblclick'
   ],

   methods: [
     function init(){
       this.views = [
         [ { class: 'foam.u2.view.TableView',columns: [
           'id', 'created', 'payer', 'payee', 'total', 'status'
         ] }, 'Table' ],
         [ {
             class: 'foam.u2.view.TreeView',
             data: this.transactionDAO,
             relationship: net.nanopay.tx.model.TransactionTransactionchildrenRelationship,
             startExpanded: true,
             draggable: false,
             formatter: function(data) { this.add(data.type); }
           }, 'Tree' ]
       ]
     },
     function dblclick(transaction) {
       this.stack.push({
         class: 'net.nanopay.admin.ui.TransactionDetailView',
         transaction: transaction
       });
     }
   ]
 });
