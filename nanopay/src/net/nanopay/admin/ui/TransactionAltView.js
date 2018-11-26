foam.CLASS({
   package: 'net.nanopay.admin.ui',
   name: 'TransactionAltView',
   extends: 'foam.u2.view.AltView',

   import: ['appConfig'],

   requires: [
     'foam.nanos.menu.Menu',
     'foam.u2.view.TableView'
   ],

   css: `
     .foam-u2-view-TreeView {
       width: 962px;
       display: block;
       overflow-x: auto;
     }
     .foam-u2-view-TableView {
       display: block;
       overflow-x: auto;
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
     function init() {
       this.views = [
         [{ class: 'foam.u2.view.TableView',
           columns: [
             'id', 'name', 'created', 'createdBy', 'payer', 'payee', 'total', 'status', 'type'
           ] }, 'Table'
         ],
         [{
             class: 'foam.u2.view.TreeView',
             data: this.transactionDAO,
             relationship: net.nanopay.tx.model.TransactionTransactionchildrenRelationship,
             startExpanded: true,
             draggable: false,
             formatter: function(data) {
               this
                   .add('ID: ').add(data.id + '  , ')
                   .add('Name: ').add(data.name + '  , ')
                   .add('Created: ').add(data.created + '  , ')
                   .add('Amount: $').add(data.amount + '  , ')
                   .add('Status: ').add(data.status.name);
             }
           }, 'Tree'
         ],
      ];
     },
     function dblclick(transaction) {
       this.stack.push({
         class: 'net.nanopay.admin.ui.TransactionDetailView',
         transaction: transaction
       });
     }
   ]
 });
