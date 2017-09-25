// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class RPCErrorMessage: AbstractFObject {

  public var data: Any? {
    get {
      
if _data_inited_ {
  return _data_
}

return nil

      
    }
set(value) {
      
self.set(key: "data", value: value)
      
    }
  }

  var _data_: Any? = nil

  var _data_inited_: Bool = false

  public static let DATA: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "data"
  let classInfo: ClassInfo
  let transient = false
  let label = "Data" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var data_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "data",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var data_Value_Sub_: Subscription?

  public var data$: Slot {
    get {
      return self.data_Value_
    }
set(value) {
      
self.data_Value_Sub_?.detach()
self.data_Value_Sub_ = self.data$.linkFrom(value)
self.onDetach(self.data_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_data_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_data_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_data_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return RPCErrorMessage.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return RPCErrorMessage.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "data":
    _data_inited_ = false
    _data_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "data"]) {
      _ = pub(["propertyChange", "data", data$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "data": return `_data_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "data": return `data`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "data": return `data$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "data$":
    data$ = value as! Slot
    return
  case "data":
  
    let oldValue: Any? = _data_inited_ ? self.`data` : nil
    _data_ = _data_preSet_(oldValue, _data_adapt_(oldValue, value))
    _data_inited_ = true
    _data_postSet_(oldValue, _data_)
    if hasListeners(["propertyChange", "data"]) && !FOAM_utils.equals(oldValue, _data_) {
      _ = pub(["propertyChange", "data", data$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.RPCErrorMessage"

    lazy var label: String = "RPCError Message"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [DATA]

    lazy var cls: AnyClass = RPCErrorMessage.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return RPCErrorMessage(args, x)
    }

  }

}