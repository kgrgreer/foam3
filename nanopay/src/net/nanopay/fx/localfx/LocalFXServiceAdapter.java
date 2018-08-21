package net.nanopay.fx.localfx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import java.util.Date;
import net.nanopay.fx.AcceptFXRate;
import net.nanopay.fx.ConfirmFXDeal;
import net.nanopay.fx.DeliveryTimeFields;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.ExchangeRateFields;
import net.nanopay.fx.ExchangeRateQuote;
import net.nanopay.fx.FXAccepted;
import net.nanopay.fx.FXDeal;
import net.nanopay.fx.FXHoldingAccountBalance;
import net.nanopay.fx.FXPayee;
import net.nanopay.fx.FXServiceAdapter;
import net.nanopay.fx.FeesFields;
import net.nanopay.fx.GetIncomingFundStatus;
import net.nanopay.fx.SubmitFXDeal;

public class LocalFXServiceAdapter extends ContextAwareSupport implements FXServiceAdapter {

    protected DAO exchangeRateDAO_;
    protected Double feeAmount = 1d;

    public LocalFXServiceAdapter() {
        exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
    }

    public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency,
            double sourceAmount, String fxDirection, String valueDate) throws RuntimeException {

        final ExchangeRateQuote quote = new ExchangeRateQuote();
        final ExchangeRateFields reqExRate = new ExchangeRateFields();
        final FeesFields reqFee = new FeesFields();
        final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

        // Fetch rates from exchangeRateDAO_
        exchangeRateDAO_.where(
                MLang.AND(
                        MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
                        MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
                )
        ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
                quote.setCode(((ExchangeRate) obj).getCode());
                quote.setExchangeRate(reqExRate);
                quote.setFee(reqFee);
                quote.setDeliveryTime(reqDlvrTime);

                reqExRate.setSourceCurrency(((ExchangeRate) obj).getFromCurrency());
                reqExRate.setTargetCurrency(((ExchangeRate) obj).getToCurrency());
                reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
                reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus().getLabel());
                reqExRate.setRate(((ExchangeRate) obj).getRate());
                reqExRate.setExpirationTime(((ExchangeRate) obj).getExpirationDate());
            }
        });

        reqExRate.setTargetAmount((sourceAmount - feeAmount) * reqExRate.getRate());
        reqExRate.setSourceAmount(sourceAmount);
        reqFee.setTotalFees(feeAmount);
        reqFee.setTotalFeesCurrency(sourceCurrency);
        reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));

        quote.setExchangeRate(reqExRate);

        return quote;

    }

    public FXAccepted acceptFXRate(AcceptFXRate request) throws RuntimeException {
        FXAccepted fxAccepted = new FXAccepted();
        fxAccepted.setCode("200");
        fxAccepted.setId(request.getId());

        return fxAccepted;
    }

    public FXDeal submitFXDeal(SubmitFXDeal request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXHoldingAccountBalance getFXAccountBalance(String fxAccountId) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXDeal confirmFXDeal(ConfirmFXDeal request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXDeal checkIncomingFundsStatus(GetIncomingFundStatus request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXPayee addFXPayee(FXPayee request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXPayee updateFXPayee(FXPayee request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXPayee deleteFXPayee(FXPayee request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    public FXPayee getPayeeInfo(FXPayee request) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
