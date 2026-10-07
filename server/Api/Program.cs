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

var requests = new List<RequestDto>
{
    new("З-2026-0001", "15.07.2026", "Выполнен", "К-2024-0001", "ООО Альфа Логистик", "Павловский ДОК", "Плита MDF", "Екатеринбург", null, null, new List<ShipmentLineDto>
    {
        new(1, "Павловский ДОК", "MDF 16 мм, 2800х2070х16", "120", "120", "4 850,00", "582 000,00"),
        new(2, "Павловский ДОК", "MDF 22 мм, 2800х2070х22", "80", "80", "5 200,00", "416 000,00")
    }),
    new("З-2026-0002", "18.08.2026", "Согласована с менеджером", "К-2026-0002", "ООО Под Пальмой", "Павловский ДОК", "Плита MDF", "Тюмень"),
    new("З-2026-0003", "17.08.2026", "На согласовании", "К-2025-0002", "ООО Куршавель", "ООО Содружество", "Погонаж", "Таджикистан"),
    new("З-2026-0004", "16.08.2026", "В работе", "К-2026-0001", "ООО Под Пальмой", "ООО Новичиха Лес", "Погонаж", "Екатеринбург"),
    new("З-2026-0005", "10.08.2026", "Доверенность заполнена", "К-2024-0001", "ООО Альфа Логистик", "Павловский ДОК", "Плита MDF", "Челябинск",
        new PowerOfAttorneyDto(
            "Петров Пётр Петрович",
            "+7 (901) 234-56-78",
            "Челябинск",
            "carrier-trans-ural",
            "ООО «Транс-Урал»",
            null,
            "Самовывоз со склада Павловский ДОК"),
        new VehicleInfoDto("tractor-tu-1", "trailer-tu-1", "А123ВС174", "АВ1234 74", "Volvo FH16", "Schmitz Cargobull"),
        new List<ShipmentLineDto>
        {
            new(1, "Павловский ДОК", "MDF 16 мм, 2800х2070х16", "95", "95", "4 850,00", "460 750,00"),
            new(2, "Павловский ДОК", "MDF 22 мм, 2800х2070х22", "60", "48", "5 200,00", "249 600,00")
        }),
    new("З-2026-0006", "05.08.2026", "Отменена", "К-2025-0002", "ООО Куршавель", "ООО Содружество", "Погонаж", "Москва"),
    new("З-2026-0007", "12.08.2026", "В работе", "К-2024-0001", "ООО Альфа Логистик", "Павловский ДОК", "Плита MDF", "Сочи"),
    new("З-2026-0008", "14.08.2026", "Согласована с менеджером", "К-2026-0002", "ООО Под Пальмой", "Павловский ДОК", "Плита MDF", "Краснодар"),
    new("З-2026-0009", "11.08.2026", "На согласовании", "К-2026-0001", "ООО Под Пальмой", "ООО Новичиха Лес", "Погонаж", "Анапа"),
    new("З-2026-0010", "09.08.2026", "Выполнен", "К-2027-0001", "ООО Викинг", "Рубцовский ЛДК", "Пиломатериалы", "Мурманск", null, null, new List<ShipmentLineDto>
    {
        new(1, "Рубцовский ЛДК", "Доска обрезная 50х150х6000, 1 сорт", "120", "0", "18 500,00", "2 220 000,00")
    }),
    new("З-2026-0011", "20.08.2026", "Согласована с менеджером", "К-2025-0001", "ООО Куршавель", "Каменский ЛДК", "Пиломатериалы", "Таджикистан", null, null, new List<ShipmentLineDto>
    {
        new(1, "Каменский ЛДК", "Доска обрезная 50х150х6000, 1 сорт", "120", "0", "18 500,00", "2 220 000,00")
    })
};

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
            contract.Supplier,
            contract.ContractDate,
            contract.FactualBalance,
            contract.ContractCurrency))
        .ToListAsync();

    return Results.Ok(new { contracts });
});

app.MapGet("/api/requests", (string? legalEntity, string? legalEntities) =>
{
    var allowedEntities = ParseLegalEntities(legalEntity, legalEntities);

    var filtered = allowedEntities.Count == 0
        ? requests
        : requests.Where(request => allowedEntities.Contains(request.LegalEntity)).ToList();

    return Results.Ok(new { requests = filtered });
});

app.MapPost("/api/requests", (CreateRequestDto payload) =>
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
        ? "Павловский ДОК"
        : payload.Supplier.Trim();

    List<ShipmentLineDto>? shipmentLines = null;
    if (payload.Items is { Count: > 0 })
    {
        shipmentLines = payload.Items
            .Select((item, index) => new ShipmentLineDto(
                index + 1,
                supplier,
                item.Nomenclature.Trim(),
                item.PackCount.ToString(),
                "0",
                "—",
                "—"))
            .ToList();
    }

    var newRequest = new RequestDto(
        Id: GetNextRequestId(requests, now),
        RequestDate: now.ToString("dd.MM.yyyy"),
        RequestStatus: "Новый",
        RequestContract: payload.RequestContract.Trim(),
        LegalEntity: payload.LegalEntity.Trim(),
        Supplier: supplier,
        Nomenclature: payload.Nomenclature.Trim(),
        Direction: payload.Direction.Trim(),
        PowerOfAttorney: payload.PowerOfAttorney,
        VehicleInfo: payload.VehicleInfo,
        ShipmentLines: shipmentLines,
        ContactPhone: string.IsNullOrWhiteSpace(payload.ContactPhone) ? null : payload.ContactPhone.Trim(),
        LogisticsType: string.IsNullOrWhiteSpace(payload.LogisticsType) ? null : payload.LogisticsType.Trim());

    requests.Insert(0, newRequest);

    return Results.Created($"/api/requests/{newRequest.Id}", newRequest);
});

app.MapPatch("/api/requests/{id}/power-of-attorney", (string id, UpdatePowerOfAttorneyDto payload) =>
{
    var requestIndex = requests.FindIndex(request => string.Equals(request.Id, id, StringComparison.OrdinalIgnoreCase));

    if (requestIndex < 0)
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

    var currentRequest = requests[requestIndex];
    var deliveryAddress = payload.DeliveryAddress.Trim();
    var isLumberRequest = string.Equals(currentRequest.Nomenclature, "Пиломатериалы", StringComparison.OrdinalIgnoreCase);

    if (isLumberRequest && string.IsNullOrWhiteSpace(payload.BorderCrossing))
    {
        return Results.BadRequest(new { message = "Укажите пункт перехода границы для заявки по пиломатериалам." });
    }

    var updatedRequest = currentRequest with
    {
        RequestStatus = "Доверенность заполнена",
        Direction = deliveryAddress,
        PowerOfAttorney = new PowerOfAttorneyDto(
            payload.DriverFullName.Trim(),
            payload.DriverPhoneNumber.Trim(),
            deliveryAddress,
            payload.CarrierId.Trim(),
            payload.CarrierName.Trim(),
            isLumberRequest ? payload.BorderCrossing?.Trim() : null,
            string.IsNullOrWhiteSpace(payload.Comment) ? null : payload.Comment.Trim()),
        VehicleInfo = payload.VehicleInfo with
        {
            TractorId = payload.VehicleInfo.TractorId.Trim(),
            TrailerId = payload.VehicleInfo.TrailerId.Trim(),
            CarPlateNumber = payload.VehicleInfo.CarPlateNumber.Trim(),
            TrailerPlateNumber = payload.VehicleInfo.TrailerPlateNumber.Trim(),
            CarBrandAndModel = payload.VehicleInfo.CarBrandAndModel.Trim(),
            TrailerBrandAndModel = payload.VehicleInfo.TrailerBrandAndModel.Trim()
        },
        ContactPhone = currentRequest.ContactPhone,
        LogisticsType = currentRequest.LogisticsType
    };

    requests[requestIndex] = updatedRequest;

    return Results.Ok(updatedRequest);
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

static string GetNextRequestId(List<RequestDto> requests, DateTime date)
{
    var year = date.Year;
    var yearPrefix = $"З-{year}-";

    var maxNumber = requests
        .Where(request => request.Id.StartsWith(yearPrefix, StringComparison.Ordinal))
        .Select(request => request.Id.Replace(yearPrefix, string.Empty))
        .Select(idPart => int.TryParse(idPart, out var numericPart) ? numericPart : 0)
        .DefaultIfEmpty(0)
        .Max();

    return $"{yearPrefix}{(maxNumber + 1):0000}";
}

record LoginRequest(string Login, string Password);

record ContractDto(string Id, string LegalEntity, string Supplier, string ContractDate, string FactualBalance, string ContractCurrency);

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
    string? Comment = null);

record PowerOfAttorneyDto(
    string DriverFullName,
    string DriverPhoneNumber,
    string DeliveryAddress,
    string CarrierId,
    string CarrierName,
    string? BorderCrossing = null,
    string? Comment = null);

record VehicleInfoDto(
    string TractorId,
    string TrailerId,
    string CarPlateNumber,
    string TrailerPlateNumber,
    string CarBrandAndModel,
    string TrailerBrandAndModel);
