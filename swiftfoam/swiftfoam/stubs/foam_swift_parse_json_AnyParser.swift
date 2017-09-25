// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class AnyParser: ProxyParser {

  override public var delegate: Parser {
    get {
      
if _delegate_inited_ {
  return _delegate_!
}

self.set(key: "delegate", value: _delegate_factory_())
return _delegate_!

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_delegate_factory_`() -> Parser {
    
return Alt(["parsers": [
  NullParser(),
  StringParser(),
  FloatParser(),
  LongParser(),
  IntParser(),
  BooleanParser(),
  FObjectParser(),
  ArrayParser(),
  MapParser(),
]])
    
  }

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Parser {
    return newValue as! Parser
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Parser) -> Parser {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Parser) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return AnyParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return AnyParser.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.AnyParser"

    lazy var label: String = "Any Parser"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [DELEGATE]

    lazy var cls: AnyClass = AnyParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return AnyParser(args, x)
    }

  }

}