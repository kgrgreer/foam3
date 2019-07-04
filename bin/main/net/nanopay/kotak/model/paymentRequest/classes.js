require('./files.js');

var classes = [
	"net.nanopay.kotak.model.paymentRequest.EnrichmentSetType",
	"net.nanopay.kotak.model.paymentRequest.Payment",
	"net.nanopay.kotak.model.paymentRequest.InstrumentListType",
	"net.nanopay.kotak.model.paymentRequest.InstrumentType",
	"net.nanopay.kotak.model.paymentRequest.RequestHeaderType"
];
var abstractClasses = [];
var skeletons = [];
var proxies = [];
var blacklist = [];

module.exports = {
  classes: classes,
  abstractClasses: abstractClasses,
  skeletons: skeletons,
  proxies: proxies,
  blacklist: blacklist
};