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
      display: block;
      overflow-x: auto;
    }
  `,

  imports: [
    'stack',
    'transactionDAO'
  ],

  methods: [
    function init() {
      this.views = [
        [
          { class: 'foam.u2.view.ScrollTableView',
            columns: [
            'status',
            'invoiceId',
            'invoiceNumber',
            'name',
            'type',
            'createdBy',
            'created',
            'payer',
            'payee',
            'total',
            'referenceNumber',
            'id',
            'processDate',
            'completionDate'
            ]
          },
          'Table'
        ],
        [
          {
            class: 'foam.u2.view.TreeView',
            data: this.transactionDAO,
            relationship: net.nanopay.tx.model.TransactionTransactionChildrenRelationship,
            startExpanded: true,
            draggable: false,
            formatter: function(data) {
              this
                .add('Name: ').add(data.name).add(', ')
                .add('Amount: $').add(data.amount).add(', ')
                .add('Status: ').add(data.status.name).add(', ')
                .add('Created By: ').add(data.createdBy).add(', ')
                .add('Created: ').add(data.created).add(', ')
                .add('ID: ').add(data.id).add(', ');
            }
          },
          'Tree'
        ]
     ];
    },
  ]
});
