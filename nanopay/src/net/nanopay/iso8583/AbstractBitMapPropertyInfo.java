package net.nanopay.iso8583;

import foam.core.AbstractPropertyInfo;
import foam.lib.json.Outputter;

public abstract class AbstractBitMapPropertyInfo
  extends AbstractPropertyInfo
{
  protected final static ThreadLocal<StringBuilder> sb_ = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  @Override
  public Object fromString(String value) {
    return FixedBitSet.valueOf(foam.util.SecurityUtil.HexStringToByteArray(value));
  }

  @Override
  public void toJSON(Outputter outputter, Object value) {
    int sum = 0;
    int digit = 1;

    StringBuilder sb = sb_.get();
    FixedBitSet set = (FixedBitSet) value;
    int bits = set.getBits();

    for ( int i = 0 ; i < bits ; i++ ) {
      int bit = set.get(i) ? 1 : 0;
      if ( digit == 1 ) {
        sum += bit * 8;
      } else if ( digit == 2 ) {
        sum += bit * 4;
      } else if ( digit == 3 ) {
        sum += bit * 2;
      } else if ( digit == 4 || i < bits + 1 ) {
        sum += bit;
        digit = 0;
        if ( sum < 10 ) {
          sb.append(sum);
        } else if ( sum == 10 ) {
          sb.append('a');
        } else if ( sum == 11 ) {
          sb.append('b');
        } else if ( sum == 12 ) {
          sb.append('c');
        } else if ( sum == 13 ) {
          sb.append('d');
        } else if ( sum == 14 ) {
          sb.append('e');
        } else if ( sum == 15 ) {
          sb.append('f');
        }
        sum = 0;
      }
      digit += 1;
    }
  }
}
