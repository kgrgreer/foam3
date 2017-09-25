// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Optional: ProxyParser {

  private static var classInfo_: ClassInfo = ClassInfo_()

  public override func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
let ret = delegate.parse(ps, x)
if ret != nil { return ret }
return ps.setValue(nil)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Optional.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Optional.classInfo_
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
  
    lazy var id: String = "foam.swift.parse.parser.Optional"

    lazy var label: String = "Optional"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [PARSE]

    lazy var cls: AnyClass = Optional.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Optional(args, x)
    }

  }

}