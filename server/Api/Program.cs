using System.Text.Json.Serialization;
using Api.Data;
using Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "frontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(dataSource));

builder.Services.AddSingleton<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.InitializeAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(frontendCorsPolicy);

app.MapGet("/api/health", async (AppDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();
    return Results.Ok(new
    {
        status = canConnect ? "ok" : "db_unavailable",
        timestamp = DateTimeOffset.UtcNow,
        database = canConnect,
    });
});

app.MapPost("/api/auth/login", async (LoginRequest payload, AppDbContext db, IPasswordHasher<AppUser> hasher) =>
{
    if (string.IsNullOrWhiteSpace(payload.Login) || string.IsNullOrWhiteSpace(payload.Password))
    {
        return Results.BadRequest(new { message = "Укажите логин и пароль." });
    }

    var login = payload.Login.Trim();
    var user = await db.Users.FirstOrDefaultAsync(item => item.Login == login);

    if (user is null)
    {
        return Results.Unauthorized();
    }

    var result = hasher.VerifyHashedPassword(user, user.PasswordHash, payload.Password);
    if (result == PasswordVerificationResult.Failed)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        login = user.Login,
        fullName = user.FullName,
        company = user.Company,
        legalEntities = user.LegalEntities,
    });
});

app.MapGet("/api/contracts", async (string? legalEntity, string? legalEntities, AppDbContext db) =>
{
    var allowedEntities = ParseLegalEntities(legalEntity, legalEntities);

    var query = db.Contracts.AsNoTracking().AsQueryable();
    if (allowedEntities.Count > 0)
    {
        query = query.Where(contract => allowedEntities.Contains(contract.LegalEntity));
    }

    var contracts = await query
        .OrderBy(contract => contract.Id)
        .Select(contract => new ContractDto(
            contract.Id,
            contract.LegalEntity,
            contract.ContractDate,
            contract.FactualBalance,
            contract.ContractCurrency))
        .ToListAsync();

    return Results.Ok(new { contracts });
});

app.MapGet("/api/requests", async (string? legalEntity, string? legalEntities, AppDbContext db) =>
{
    var allowedEntities = ParseLegalEntities(legalEntity, legalEntities);

    var query = db.Requests
        .AsNoTracking()
        .Include(request => request.ShipmentLines)
        .AsQueryable();

    if (allowedEntities.Count > 0)
    {
        query = query.Where(request => allowedEntities.Contains(request.LegalEntity));
    }

    var requests = await query
        .OrderByDescending(request => request.Id)
        .ToListAsync();

    var payload = requests.Select(MapRequestDto).ToList();
    return Results.Ok(new { requests = payload });
});

app.MapPost("/api/requests", async (CreateRequestDto payload, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(payload.LegalEntity) ||
        string.IsNullOrWhiteSpace(payload.Nomenclature) ||
        string.IsNullOrWhiteSpace(payload.RequestContract) ||
        string.IsNullOrWhiteSpace(payload.Direction))
    {
        return Results.BadRequest(new { message = "Не заполнены обязательные поля заявки." });
    }

    var now = DateTime.Now;
    var supplier = string.IsNullOrWhiteSpace(payload.Supplier)
        ? "Рубцовский ЛДК"
        : payload.Supplier.Trim();

    var requestId = await GetNextRequestIdAsync(db, now);

    var newRequest = new Request
    {
        Id = requestId,
        RequestDate = now.ToString("dd.MM.yyyy"),
        RequestStatus = "Новый",
        RequestContract = payload.RequestContract.Trim(),
        LegalEntity = payload.LegalEntity.Trim(),
        Supplier = supplier,
        Nomenclature = payload.Nomenclature.Trim(),
        Direction = payload.Direction.Trim(),
        ContactPhone = string.IsNullOrWhiteSpace(payload.ContactPhone) ? null : payload.ContactPhone.Trim(),
        LogisticsType = string.IsNullOrWhiteSpace(payload.LogisticsType) ? null : payload.LogisticsType.Trim(),
        PowerOfAttorney = MapPowerOfAttorney(payload.PowerOfAttorney),
        VehicleInfo = MapVehicleInfo(payload.VehicleInfo),
    };

    if (payload.Items is { Count: > 0 })
    {
        newRequest.ShipmentLines = payload.Items
            .Select((item, index) => new ShipmentLine
            {
                LineNumber = index + 1,
                Warehouse = supplier,
                Nomenclature = item.Nomenclature.Trim(),
                Quantity = item.PackCount.ToString(),
                Shipped = "0",
                Price = "—",
                Amount = "—",
            })
            .ToList();
    }

    db.Requests.Add(newRequest);
    await db.SaveChangesAsync();

    return Results.Created($"/api/requests/{newRequest.Id}", MapRequestDto(newRequest));
});

app.MapPatch("/api/requests/{id}/power-of-attorney", async (string id, UpdatePowerOfAttorneyDto payload, AppDbContext db) =>
{
    var currentRequest = await db.Requests
        .Include(request => request.ShipmentLines)
        .FirstOrDefaultAsync(request => request.Id == id);

    if (currentRequest is null)
    {
        return Results.NotFound(new { message = "Заявка не найдена." });
    }

    var phoneDigits = new string((payload.DriverPhoneNumber ?? string.Empty).Where(char.IsDigit).ToArray());
    if (phoneDigits.StartsWith('8'))
    {
        phoneDigits = "7" + phoneDigits[1..];
    }

    var isPhoneValid = phoneDigits.Length == 11 && phoneDigits.StartsWith('7');

    if (string.IsNullOrWhiteSpace(payload.DriverFullName) ||
        string.IsNullOrWhiteSpace(payload.DriverPhoneNumber) ||
        !isPhoneValid ||
        string.IsNullOrWhiteSpace(payload.DeliveryAddress) ||
        string.IsNullOrWhiteSpace(payload.CarrierId) ||
        string.IsNullOrWhiteSpace(payload.CarrierName) ||
        payload.VehicleInfo is null ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.TractorId) ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.TrailerId) ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.CarPlateNumber) ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.TrailerPlateNumber) ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.CarBrandAndModel) ||
        string.IsNullOrWhiteSpace(payload.VehicleInfo.TrailerBrandAndModel))
    {
        return Results.BadRequest(new { message = "Не заполнены обязательные поля доверенности." });
    }

    var deliveryAddress = payload.DeliveryAddress.Trim();
    var isLumberRequest = string.Equals(currentRequest.Nomenclature, "Пиломатериалы", StringComparison.OrdinalIgnoreCase);

    if (isLumberRequest && string.IsNullOrWhiteSpace(payload.BorderCrossing))
    {
        return Results.BadRequest(new { message = "Укажите пункт перехода границы для заявки по пиломатериалам." });
    }

    currentRequest.RequestStatus = "Доверенность заполнена";
    currentRequest.Direction = deliveryAddress;
    currentRequest.PowerOfAttorney = new PowerOfAttorneyData
    {
        DriverFullName = payload.DriverFullName.Trim(),
        DriverPhoneNumber = payload.DriverPhoneNumber.Trim(),
        DeliveryAddress = deliveryAddress,
        CarrierId = payload.CarrierId.Trim(),
        CarrierName = payload.CarrierName.Trim(),
        BorderCrossing = isLumberRequest ? payload.BorderCrossing?.Trim() : null,
        Attachment = payload.Attachment is null
            ? null
            : new PowerOfAttorneyAttachmentData
            {
                FileName = payload.Attachment.FileName,
                ContentType = payload.Attachment.ContentType,
                FileSize = payload.Attachment.FileSize,
                ContentBase64 = payload.Attachment.ContentBase64,
            },
    };
    currentRequest.VehicleInfo = MapVehicleInfo(payload.VehicleInfo);

    await db.SaveChangesAsync();

    return Results.Ok(MapRequestDto(currentRequest));
});

app.Run();

static HashSet<string> ParseLegalEntities(string? legalEntity, string? legalEntities)
{
    var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    if (!string.IsNullOrWhiteSpace(legalEntities))
    {
        foreach (var entity in legalEntities.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            result.Add(entity);
        }
    }

    if (!string.IsNullOrWhiteSpace(legalEntity))
    {
        result.Add(legalEntity.Trim());
    }

    return result;
}

static async Task<string> GetNextRequestIdAsync(AppDbContext db, DateTime date)
{
    var year = date.Year;
    var yearPrefix = $"З-{year}-";

    var ids = await db.Requests
        .AsNoTracking()
        .Where(request => request.Id.StartsWith(yearPrefix))
        .Select(request => request.Id)
        .ToListAsync();

    var maxNumber = ids
        .Select(id => id.Replace(yearPrefix, string.Empty))
        .Select(idPart => int.TryParse(idPart, out var numericPart) ? numericPart : 0)
        .DefaultIfEmpty(0)
        .Max();

    return $"{yearPrefix}{(maxNumber + 1):0000}";
}

static RequestDto MapRequestDto(Request request) =>
    new(
        request.Id,
        request.RequestDate,
        request.RequestStatus,
        request.RequestContract,
        request.LegalEntity,
        request.Supplier,
        request.Nomenclature,
        request.Direction,
        request.PowerOfAttorney is null
            ? null
            : new PowerOfAttorneyDto(
                request.PowerOfAttorney.DriverFullName,
                request.PowerOfAttorney.DriverPhoneNumber,
                request.PowerOfAttorney.DeliveryAddress,
                request.PowerOfAttorney.CarrierId,
                request.PowerOfAttorney.CarrierName,
                request.PowerOfAttorney.BorderCrossing,
                request.PowerOfAttorney.Attachment is null
                    ? null
                    : new PowerOfAttorneyAttachmentDto(
                        request.PowerOfAttorney.Attachment.FileName,
                        request.PowerOfAttorney.Attachment.ContentType,
                        request.PowerOfAttorney.Attachment.FileSize,
                        request.PowerOfAttorney.Attachment.ContentBase64)),
        request.VehicleInfo is null
            ? null
            : new VehicleInfoDto(
                request.VehicleInfo.TractorId,
                request.VehicleInfo.TrailerId,
                request.VehicleInfo.CarPlateNumber,
                request.VehicleInfo.TrailerPlateNumber,
                request.VehicleInfo.CarBrandAndModel,
                request.VehicleInfo.TrailerBrandAndModel),
        request.ShipmentLines
            .OrderBy(line => line.LineNumber)
            .Select(line => new ShipmentLineDto(
                line.LineNumber,
                line.Warehouse,
                line.Nomenclature,
                line.Quantity,
                line.Shipped,
                line.Price,
                line.Amount))
            .ToList(),
        request.ContactPhone,
        request.LogisticsType);

static PowerOfAttorneyData? MapPowerOfAttorney(PowerOfAttorneyDto? payload) =>
    payload is null
        ? null
        : new PowerOfAttorneyData
        {
            DriverFullName = payload.DriverFullName,
            DriverPhoneNumber = payload.DriverPhoneNumber,
            DeliveryAddress = payload.DeliveryAddress,
            CarrierId = payload.CarrierId,
            CarrierName = payload.CarrierName,
            BorderCrossing = payload.BorderCrossing,
            Attachment = payload.Attachment is null
                ? null
                : new PowerOfAttorneyAttachmentData
                {
                    FileName = payload.Attachment.FileName,
                    ContentType = payload.Attachment.ContentType,
                    FileSize = payload.Attachment.FileSize,
                    ContentBase64 = payload.Attachment.ContentBase64,
                },
        };

static VehicleInfoData? MapVehicleInfo(VehicleInfoDto? payload) =>
    payload is null
        ? null
        : new VehicleInfoData
        {
            TractorId = payload.TractorId,
            TrailerId = payload.TrailerId,
            CarPlateNumber = payload.CarPlateNumber,
            TrailerPlateNumber = payload.TrailerPlateNumber,
            CarBrandAndModel = payload.CarBrandAndModel,
            TrailerBrandAndModel = payload.TrailerBrandAndModel,
        };

record LoginRequest(string Login, string Password);

record ContractDto(string Id, string LegalEntity, string ContractDate, string FactualBalance, string ContractCurrency);

record ShipmentLineDto(
    int LineNumber,
    string Warehouse,
    string Nomenclature,
    string Quantity,
    string Shipped,
    string Price,
    string Amount);

record RequestDto(
    string Id,
    string RequestDate,
    string RequestStatus,
    string RequestContract,
    string LegalEntity,
    string Supplier,
    string Nomenclature,
    string Direction,
    PowerOfAttorneyDto? PowerOfAttorney = null,
    VehicleInfoDto? VehicleInfo = null,
    List<ShipmentLineDto>? ShipmentLines = null,
    string? ContactPhone = null,
    string? LogisticsType = null);

record CreateRequestItemDto(string Nomenclature, int PackCount);

record CreateRequestDto(
    string LegalEntity,
    string Nomenclature,
    string Volume,
    string RequestContract,
    string Direction,
    string? Supplier = null,
    string? ProductType = null,
    string? ContactPhone = null,
    string? LogisticsType = null,
    List<CreateRequestItemDto>? Items = null,
    PowerOfAttorneyDto? PowerOfAttorney = null,
    VehicleInfoDto? VehicleInfo = null);

record UpdatePowerOfAttorneyDto(
    string DriverFullName,
    string DriverPhoneNumber,
    string DeliveryAddress,
    string CarrierId,
    string CarrierName,
    VehicleInfoDto VehicleInfo,
    string? BorderCrossing = null,
    PowerOfAttorneyAttachmentDto? Attachment = null);

record PowerOfAttorneyDto(
    string DriverFullName,
    string DriverPhoneNumber,
    string DeliveryAddress,
    string CarrierId,
    string CarrierName,
    string? BorderCrossing = null,
    PowerOfAttorneyAttachmentDto? Attachment = null);

record PowerOfAttorneyAttachmentDto(
    string FileName,
    string ContentType,
    long FileSize,
    string? ContentBase64);

record VehicleInfoDto(
    string TractorId,
    string TrailerId,
    string CarPlateNumber,
    string TrailerPlateNumber,
    string CarBrandAndModel,
    string TrailerBrandAndModel);
