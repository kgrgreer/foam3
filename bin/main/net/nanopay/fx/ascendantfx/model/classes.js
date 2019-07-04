require('./files.js');

var classes = [
	"net.nanopay.fx.ascendantfx.model.GetQuoteRequest",
	"net.nanopay.fx.ascendantfx.model.Deal",
	"net.nanopay.fx.ascendantfx.model.Direction",
	"net.nanopay.fx.ascendantfx.model.OriginatorType",
	"net.nanopay.fx.ascendantfx.model.GetQuoteResult",
	"net.nanopay.fx.ascendantfx.model.Quote",
	"net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest",
	"net.nanopay.fx.ascendantfx.model.AcceptQuoteResult",
	"net.nanopay.fx.ascendantfx.model.SubmitDealRequest",
	"net.nanopay.fx.ascendantfx.model.DealDetail",
	"net.nanopay.fx.ascendantfx.model.Payee",
	"net.nanopay.fx.ascendantfx.model.SubmitDealResult",
	"net.nanopay.fx.ascendantfx.model.SubmitIncomingDealRequest",
	"net.nanopay.fx.ascendantfx.model.SubmitIncomingDealDetail",
	"net.nanopay.fx.ascendantfx.model.SubmitIncomingPayee",
	"net.nanopay.fx.ascendantfx.model.SubmitIncomingDealResult",
	"net.nanopay.fx.ascendantfx.model.InstructionToSender",
	"net.nanopay.fx.ascendantfx.model.GetAccountBalanceRequest",
	"net.nanopay.fx.ascendantfx.model.GetAccountBalanceResult",
	"net.nanopay.fx.ascendantfx.model.AccountDetails",
	"net.nanopay.fx.ascendantfx.model.ValidateIBANRequest",
	"net.nanopay.fx.ascendantfx.model.ValidateIBANResult",
	"net.nanopay.fx.ascendantfx.model.PayeeOperationRequest",
	"net.nanopay.fx.ascendantfx.model.PayeeDetail",
	"net.nanopay.fx.ascendantfx.model.PayeeOperationResult",
	"net.nanopay.fx.ascendantfx.model.GetPayeeInfoRequest",
	"net.nanopay.fx.ascendantfx.model.GetPayeeInfoResult",
	"net.nanopay.fx.ascendantfx.model.PostDealRequest",
	"net.nanopay.fx.ascendantfx.model.PostDealResult",
	"net.nanopay.fx.ascendantfx.model.DealDetails",
	"net.nanopay.fx.ascendantfx.model.PostDealConfirmationRequest",
	"net.nanopay.fx.ascendantfx.model.DealPostConfirm",
	"net.nanopay.fx.ascendantfx.model.PostDealConfirmationResult",
	"net.nanopay.fx.ascendantfx.model.PayeeInfoValidationRequest",
	"net.nanopay.fx.ascendantfx.model.PayeeInfoValidationResult",
	"net.nanopay.fx.ascendantfx.model.ValidationDetails",
	"net.nanopay.fx.ascendantfx.model.ErrorDetails",
	"net.nanopay.fx.ascendantfx.model.GetAccountActivityRequest",
	"net.nanopay.fx.ascendantfx.model.GetAccountActivityResult",
	"net.nanopay.fx.ascendantfx.model.TransactionDetails",
	"net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckRequest",
	"net.nanopay.fx.ascendantfx.model.IncomingFundStatusCheckResult",
	"net.nanopay.fx.ascendantfx.model.GetQuoteTBARequest",
	"net.nanopay.fx.ascendantfx.model.GetQuoteTBAResult",
	"net.nanopay.fx.ascendantfx.model.AcceptAndSubmitDealTBAResult",
	"net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionRequest",
	"net.nanopay.fx.ascendantfx.model.IncomingPaymentInstructionResult"
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