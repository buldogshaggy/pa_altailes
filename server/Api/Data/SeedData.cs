using Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync())
        {
            var hasher = new PasswordHasher<AppUser>();

            var demo = new AppUser
            {
                Login = "demo",
                FullName = "Иванов И. И.",
                Company = "ООО Альфа Логистик",
                LegalEntities = ["ООО Альфа Логистик"],
            };
            demo.PasswordHash = hasher.HashPassword(demo, "demo123");

            var holding = new AppUser
            {
                Login = "holding",
                FullName = "Сидоров С. С.",
                Company = "ГК Алтайлес",
                LegalEntities = ["ООО Куршавель", "ООО Под Пальмой", "ООО Викинг"],
            };
            holding.PasswordHash = hasher.HashPassword(holding, "holding123");

            db.Users.AddRange(demo, holding);
        }

        if (!await db.Contracts.AnyAsync())
        {
            db.Contracts.AddRange(
                new Contract { Id = "К-2024-0001", LegalEntity = "ООО Альфа Логистик", ContractDate = "21.01.27", FactualBalance = "9 560 000", ContractCurrency = "EUR" },
                new Contract { Id = "К-2024-0002", LegalEntity = "ООО Альфа Логистик", ContractDate = "15.06.27", FactualBalance = "4 200 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2025-0001", LegalEntity = "ООО Куршавель", ContractDate = "21.02.27", FactualBalance = "999 560 000", ContractCurrency = "USD" },
                new Contract { Id = "К-2025-0002", LegalEntity = "ООО Куршавель", ContractDate = "10.05.27", FactualBalance = "120 000 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2026-0001", LegalEntity = "ООО Под Пальмой", ContractDate = "21.03.27", FactualBalance = "10 560 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2026-0002", LegalEntity = "ООО Под Пальмой", ContractDate = "01.07.27", FactualBalance = "8 300 000", ContractCurrency = "EUR" },
                new Contract { Id = "К-2027-0001", LegalEntity = "ООО Викинг", ContractDate = "21.04.27", FactualBalance = "15 560 000", ContractCurrency = "USD" },
                new Contract { Id = "К-2027-0002", LegalEntity = "ООО Викинг", ContractDate = "18.08.27", FactualBalance = "6 750 000", ContractCurrency = "RUB" }
            );
        }

        if (!await db.Requests.AnyAsync())
        {
            db.Requests.AddRange(
                new Request
                {
                    Id = "З-2026-0001",
                    RequestDate = "15.07.2026",
                    RequestStatus = "Выполнен",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "Рубцовский ЛДК",
                    Nomenclature = "Плита MDF",
                    Direction = "Екатеринбург",
                    ShipmentLines =
                    [
                        new ShipmentLine { LineNumber = 1, Warehouse = "Рубцовский ЛДК", Nomenclature = "MDF 16 мм, 2800х2070х16", Quantity = "120", Shipped = "120", Price = "4 850,00", Amount = "582 000,00" },
                        new ShipmentLine { LineNumber = 2, Warehouse = "Рубцовский ЛДК", Nomenclature = "MDF 22 мм, 2800х2070х22", Quantity = "80", Shipped = "80", Price = "5 200,00", Amount = "416 000,00" },
                    ],
                },
                new Request
                {
                    Id = "З-2026-0002",
                    RequestDate = "18.08.2026",
                    RequestStatus = "Согласована с менеджером",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "Каменский ЛДК",
                    Nomenclature = "Плита MDF",
                    Direction = "Тюмень",
                },
                new Request
                {
                    Id = "З-2026-0003",
                    RequestDate = "17.08.2026",
                    RequestStatus = "На согласовании",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "ООО Содружество",
                    Nomenclature = "Погонаж",
                    Direction = "Таджикистан",
                },
                new Request
                {
                    Id = "З-2026-0004",
                    RequestDate = "16.08.2026",
                    RequestStatus = "В работе",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "Рубцовский ЛДК",
                    Nomenclature = "Погонаж",
                    Direction = "Екатеринбург",
                },
                new Request
                {
                    Id = "З-2026-0005",
                    RequestDate = "10.08.2026",
                    RequestStatus = "Доверенность заполнена",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "Каменский ЛДК",
                    Nomenclature = "Плита MDF",
                    Direction = "Челябинск",
                    PowerOfAttorney = new PowerOfAttorneyData
                    {
                        DriverFullName = "Петров Пётр Петрович",
                        DriverPhoneNumber = "+7 (901) 234-56-78",
                        DeliveryAddress = "Челябинск",
                        CarrierId = "carrier-trans-ural",
                        CarrierName = "ООО «Транс-Урал»",
                        Attachment = new PowerOfAttorneyAttachmentData
                        {
                            FileName = "доверенность-з-2026-0005.pdf",
                            ContentType = "application/pdf",
                            FileSize = 245760,
                        },
                    },
                    VehicleInfo = new VehicleInfoData
                    {
                        TractorId = "tractor-tu-1",
                        TrailerId = "trailer-tu-1",
                        CarPlateNumber = "А123ВС174",
                        TrailerPlateNumber = "АВ1234 74",
                        CarBrandAndModel = "Volvo FH16",
                        TrailerBrandAndModel = "Schmitz Cargobull",
                    },
                    ShipmentLines =
                    [
                        new ShipmentLine { LineNumber = 1, Warehouse = "Каменский ЛДК", Nomenclature = "MDF 16 мм, 2800х2070х16", Quantity = "95", Shipped = "95", Price = "4 850,00", Amount = "460 750,00" },
                        new ShipmentLine { LineNumber = 2, Warehouse = "Каменский ЛДК", Nomenclature = "MDF 22 мм, 2800х2070х22", Quantity = "60", Shipped = "48", Price = "5 200,00", Amount = "249 600,00" },
                    ],
                },
                new Request
                {
                    Id = "З-2026-0006",
                    RequestDate = "05.08.2026",
                    RequestStatus = "Отменена",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "ООО Содружество",
                    Nomenclature = "Погонаж",
                    Direction = "Москва",
                },
                new Request
                {
                    Id = "З-2026-0007",
                    RequestDate = "12.08.2026",
                    RequestStatus = "В работе",
                    RequestContract = "К-2025-0001",
                    LegalEntity = "ООО Куршавель",
                    Supplier = "Рубцовский ЛДК",
                    Nomenclature = "Плита MDF",
                    Direction = "Сочи",
                },
                new Request
                {
                    Id = "З-2026-0008",
                    RequestDate = "14.08.2026",
                    RequestStatus = "Согласована с менеджером",
                    RequestContract = "К-2025-0001",
                    LegalEntity = "ООО Куршавель",
                    Supplier = "Каменский ЛДК",
                    Nomenclature = "Плита MDF",
                    Direction = "Краснодар",
                },
                new Request
                {
                    Id = "З-2026-0009",
                    RequestDate = "11.08.2026",
                    RequestStatus = "На согласовании",
                    RequestContract = "К-2026-0001",
                    LegalEntity = "ООО Под Пальмой",
                    Supplier = "ООО Содружество",
                    Nomenclature = "Погонаж",
                    Direction = "Анапа",
                },
                new Request
                {
                    Id = "З-2026-0010",
                    RequestDate = "09.08.2026",
                    RequestStatus = "Выполнен",
                    RequestContract = "К-2027-0001",
                    LegalEntity = "ООО Викинг",
                    Supplier = "Рубцовский ЛДК",
                    Nomenclature = "Погонаж",
                    Direction = "Мурманск",
                },
                new Request
                {
                    Id = "З-2026-0011",
                    RequestDate = "20.08.2026",
                    RequestStatus = "Согласована с менеджером",
                    RequestContract = "К-2024-0001",
                    LegalEntity = "ООО Альфа Логистик",
                    Supplier = "Рубцовский ЛДК",
                    Nomenclature = "Пиломатериалы",
                    Direction = "Таджикистан",
                    ShipmentLines =
                    [
                        new ShipmentLine { LineNumber = 1, Warehouse = "Рубцовский ЛДК", Nomenclature = "Доска обрезная 50х150х6000, 1 сорт", Quantity = "120", Shipped = "0", Price = "18 500,00", Amount = "2 220 000,00" },
                    ],
                }
            );
        }

        await db.SaveChangesAsync();
    }
}
