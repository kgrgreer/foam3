foam.POM({
  name: 'np-app',
  version: 22,
  modules: [
    { name: 'files' },
    { name: 'foam/nanos/nanos' },
    { name: 'foam/support/support' },
    { name: '../../nanopay/src/net/nanopay/files' },
    { name: '../../nanopay/src/net/nanopay/iso20022/files' },
    { name: '../../nanopay/src/net/nanopay/iso8583/files' },
    { name: '../../nanopay/src/net/nanopay/flinks/utils/files' }
  ],
  jsLib: [
    { name: '../../../../node_modules/html2canvas/dist/html2canvas.min.js', defer: true },
    { name: '../../../../node_modules/jspdf/dist/jspdf.umd.min.js' },
    { name: '../../../../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js', defer: true },
    { name: 'https://cdn.plaid.com/link/v2/stable/link-initialize.js', async: true },
    { name: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js', defer: true }
  ]
});
