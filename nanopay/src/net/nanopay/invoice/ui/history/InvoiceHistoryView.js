foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invoice actions',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.history.HistoryRecord',
    'foam.dao.history.PropertyUpdate',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceHistoryItemView',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'invoiceHistoryDAO',
    'invoiceDAO'
  ],

  css: `
    ^ {
      margin-top: 20px;
    }
  `,

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: `Please use class when defining data type`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      expression: function(id) {
        var self = this;
        // Filter the invoice history DAO and only take the records that have
        // to do with the invoice we're looking at.
        var filteredInvoiceHistoryDAO = this.invoiceHistoryDAO
          .where(this.EQ(this.HistoryRecord.OBJECT_ID, id));

        // We're going to append a 'fake' record to the DAO which contains the
        // change of status to OverDue if it makes sense to do so.

        // Create the MDAO and load the relevant existing records into it
        var previousStatus;
        var mdao = foam.dao.MDAO.create({ of: this.HistoryRecord });
        filteredInvoiceHistoryDAO.select(function(o) {
          var status = o.updates.find((u) => u.name === 'status');
          
          var canBeFailed = true;
          if ( status === undefined ) {
            canBeFailed = false;
            // Do not return if updates length is zero ("Invoice Created")
            if (o.updates.length != 0) return null;
          }

          if (
            canBeFailed &&
            previousStatus &&
            status.newValue === self.InvoiceStatus.UNPAID &&
            previousStatus.newValue === self.InvoiceStatus.PROCESSING
          ) {
            var declinedTimestamp = new Date(o.timestamp);
            declinedTimestamp.setSeconds(declinedTimestamp.getSeconds() - 1) // Failed status will appear before unpaid
            mdao.put(self.HistoryRecord.create({
              objectId: id,
              timestamp: declinedTimestamp,
              updates: [
                self.PropertyUpdate.create({
                  name: 'status',
                  oldValue: self.InvoiceStatus.UNPAID, // Doesn't matter
                  newValue: self.InvoiceStatus.FAILED
                })
              ]
            }));
          }
          previousStatus = status;
          mdao.put(o);
        });

        // Load the invoice and check the status to see if it's overDue. If it
        // is, add it to the MDAO.
        this.invoiceDAO.find(id).then((invoice) => {
          if ( invoice.dueDate && invoice.dueDate.getTime() < Date.now() &&
              ( invoice.status != this.InvoiceStatus.PAID && invoice.status != this.InvoiceStatus.PROCESSING ) ) {
            mdao.put(this.HistoryRecord.create({
              objectId: id,
              timestamp: invoice.dueDate,
              updates: [
                this.PropertyUpdate.create({
                  name: 'status',
                  oldValue: this.InvoiceStatus.UNPAID, // Doesn't matter
                  newValue: this.InvoiceStatus.OVERDUE
                })
              ]
            }));
          }
        });

        // Use the filtered DAO with the (possibly) appended value to populate
        // the view.
        return mdao;
      }
    },
    {
      name: 'invoiceReceivedHistoryItem',
      factory: function() {
        return this.InvoiceReceivedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          title: 'Invoice History',
          data$: this.data$,
          historyItemView: this.InvoiceHistoryItemView.create()
        });
    }
  ]
});
