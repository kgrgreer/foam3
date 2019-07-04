require('./files.js');

var classes = [
	"net.nanopay.kotak.model.paymentResponse.Acknowledgement",
	"net.nanopay.kotak.model.paymentResponse.AcknowledgementType",
	"net.nanopay.kotak.model.paymentResponse.ErrorListType",
	"net.nanopay.kotak.model.paymentResponse.FaultListType",
	"net.nanopay.kotak.model.paymentResponse.FaultType",
	"net.nanopay.kotak.model.paymentResponse.InstrumentListType",
	"net.nanopay.kotak.model.paymentResponse.InstrumentType"
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