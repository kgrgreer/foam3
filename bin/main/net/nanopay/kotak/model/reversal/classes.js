require('./files.js');

var classes = [
	"net.nanopay.kotak.model.reversal.DetailsType",
	"net.nanopay.kotak.model.reversal.HeaderType",
	"net.nanopay.kotak.model.reversal.Rev_DetailType",
	"net.nanopay.kotak.model.reversal.Reversal"
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