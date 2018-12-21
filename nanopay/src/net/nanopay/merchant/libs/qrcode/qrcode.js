if ( 'function' === typeof importScripts ) {
  importScripts('qrcodegen.js');

  var QRC = qrcodegen.QrCode;

  self.addEventListener('message', function (e) {
    var qr0 = QRC.encodeText(e.data, QRC.Ecc.MEDIUM);
    self.postMessage(qr0.toSvgString(2))
  }, false);
}