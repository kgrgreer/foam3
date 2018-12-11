require('./files.js');

var classes = [
	"net.nanopay.fx.kotak.model.EnrichmentSetType",
	"net.nanopay.fx.kotak.model.InitiateRequest",
	"net.nanopay.fx.kotak.model.InstrumentListType",
	"net.nanopay.fx.kotak.model.InstrumentType",
	"net.nanopay.fx.kotak.model.RequestHeaderType",
	"net.nanopay.fx.kotak.model.Acknowledgement",
	"net.nanopay.fx.kotak.model.AcknowledgementType",
	"net.nanopay.fx.kotak.model.ErrorListType",
	"net.nanopay.fx.kotak.model.FaultListType",
	"net.nanopay.fx.kotak.model.FaultType",
	"net.nanopay.fx.kotak.model.InstrumentListType",
	"net.nanopay.fx.kotak.model.InstrumentType",
	"net.nanopay.fx.kotak.model.DetailsType",
	"net.nanopay.fx.kotak.model.HeaderType",
	"net.nanopay.fx.kotak.model.Rev_DetailType",
	"net.nanopay.fx.kotak.model.Reversal"
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