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
                new Contract { Id = "К-2024-0001", LegalEntity = "ООО Альфа Логистик", Supplier = "Павловский ДОК", ContractDate = "21.01.27", FactualBalance = "9 560 000", ContractCurrency = "EUR" },
                new Contract { Id = "К-2024-0002", LegalEntity = "ООО Альфа Логистик", Supplier = "Рубцовский ЛДК", ContractDate = "15.06.27", FactualBalance = "4 200 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2025-0001", LegalEntity = "ООО Куршавель", Supplier = "Каменский ЛДК", ContractDate = "21.02.27", FactualBalance = "999 560 000", ContractCurrency = "USD" },
                new Contract { Id = "К-2025-0002", LegalEntity = "ООО Куршавель", Supplier = "ООО Содружество", ContractDate = "10.05.27", FactualBalance = "120 000 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2026-0001", LegalEntity = "ООО Под Пальмой", Supplier = "ООО Новичиха Лес", ContractDate = "21.03.27", FactualBalance = "10 560 000", ContractCurrency = "RUB" },
                new Contract { Id = "К-2026-0002", LegalEntity = "ООО Под Пальмой", Supplier = "Павловский ДОК", ContractDate = "01.07.27", FactualBalance = "8 300 000", ContractCurrency = "EUR" },
                new Contract { Id = "К-2027-0001", LegalEntity = "ООО Викинг", Supplier = "Рубцовский ЛДК", ContractDate = "21.04.27", FactualBalance = "15 560 000", ContractCurrency = "USD" },
                new Contract { Id = "К-2027-0002", LegalEntity = "ООО Викинг", Supplier = "Каменский ЛДК", ContractDate = "18.08.27", FactualBalance = "6 750 000", ContractCurrency = "RUB" }
            );
        }
        else
        {
            var suppliersByContractId = new Dictionary<string, string>
            {
                ["К-2024-0001"] = "Павловский ДОК",
                ["К-2024-0002"] = "Рубцовский ЛДК",
                ["К-2025-0001"] = "Каменский ЛДК",
                ["К-2025-0002"] = "ООО Содружество",
                ["К-2026-0001"] = "ООО Новичиха Лес",
                ["К-2026-0002"] = "Павловский ДОК",
                ["К-2027-0001"] = "Рубцовский ЛДК",
                ["К-2027-0002"] = "Каменский ЛДК",
            };

            var contracts = await db.Contracts.ToListAsync();

            foreach (var contract in contracts)
            {
                if (suppliersByContractId.TryGetValue(contract.Id, out var supplier) &&
                    contract.Supplier != supplier)
                {
                    contract.Supplier = supplier;
                }
            }
        }

        await db.SaveChangesAsync();
    }
}
