//
//  RegionService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-20.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class RegionService: Service {
  public static let instance: RegionService = RegionService()

  // Helps determine type of error to handle on frontend
  public enum RegionError: ServiceErrorProtocol {
    case IncorrectRegionCode
    public func description() -> String {
      switch(self) {
      case .IncorrectRegionCode:
        return "Incorrect Region Id"
      }
    }
  }

  private var regions: [Region]?

  init() {
    super.init(withURL: ServiceURL.Region)
  }

  public func getAllRegions(callback: @escaping (Any?) -> Void) {
    guard regions == nil else {
      callback(regions)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let sink = (try self.dao.skip(0).limit(300).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard let array = sink.array as? [Region] else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard array.count > 0 else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

        self.regions = array

        DispatchQueue.main.async {
          callback(self.regions)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getRegion(byCode code: String, callback: @escaping (Any?) -> Void) {
    guard regions == nil else {
      findRegion(byCode: code, callback: callback)
      return
    }
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let sink = (try self.dao.skip(0).limit(300).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard let array = sink.array as? [Region] else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard array.count > 0 else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

        self.regions = array

        DispatchQueue.main.async {
          self.findRegion(byCode: code, callback: callback)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getRegions(byCountryCode code: String, callback: @escaping (Any?) -> Void) {
    guard regions == nil else {
      findRegions(byCountryCode: code, callback: callback)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let sink = (try self.dao.skip(0).limit(300).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard let array = sink.array as? [Region] else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard array.count > 0 else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

        self.regions = array

        DispatchQueue.main.async {
          self.findRegions(byCountryCode: code, callback: callback)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  func findRegion(byCode code: String, callback: @escaping (Any?) -> Void) {
    guard regions != nil else {
      callback(ServiceError.Failed)
      return
    }

    for region in regions! {
      if region.code == code {

        callback(region)
        return
      }
    }
    callback(RegionError.IncorrectRegionCode)
  }

  func findRegions(byCountryCode code: String, callback: @escaping (Any?) -> Void) {
    guard regions != nil else {
      callback(ServiceError.Failed)
      return
    }

    var regionsInCountry: [Region] = []
    for region in regions! {
      if String(describing: region.countryId!) == code {
        regionsInCountry.append(region)
      }
    }
    callback(regionsInCountry)
  }
}
