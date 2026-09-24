namespace Api.Entities;

public class Request
{
    public string Id { get; set; } = string.Empty;
    public string RequestDate { get; set; } = string.Empty;
    public string RequestStatus { get; set; } = string.Empty;
    public string RequestContract { get; set; } = string.Empty;
    public string LegalEntity { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string Nomenclature { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? LogisticsType { get; set; }
    public PowerOfAttorneyData? PowerOfAttorney { get; set; }
    public VehicleInfoData? VehicleInfo { get; set; }
    public List<ShipmentLine> ShipmentLines { get; set; } = [];
}

public class ShipmentLine
{
    public int Id { get; set; }
    public string RequestId { get; set; } = string.Empty;
    public Request? Request { get; set; }
    public int LineNumber { get; set; }
    public string Warehouse { get; set; } = string.Empty;
    public string Nomenclature { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Shipped { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
}

public class PowerOfAttorneyData
{
    public string DriverFullName { get; set; } = string.Empty;
    public string DriverPhoneNumber { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string CarrierId { get; set; } = string.Empty;
    public string CarrierName { get; set; } = string.Empty;
    public string? BorderCrossing { get; set; }
    public PowerOfAttorneyAttachmentData? Attachment { get; set; }
}

public class PowerOfAttorneyAttachmentData
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? ContentBase64 { get; set; }
}

public class VehicleInfoData
{
    public string TractorId { get; set; } = string.Empty;
    public string TrailerId { get; set; } = string.Empty;
    public string CarPlateNumber { get; set; } = string.Empty;
    public string TrailerPlateNumber { get; set; } = string.Empty;
    public string CarBrandAndModel { get; set; } = string.Empty;
    public string TrailerBrandAndModel { get; set; } = string.Empty;
}
