using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Contract> Contracts => Set<Contract>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Login).IsUnique();
            entity.Property(user => user.Login).HasMaxLength(64).IsRequired();
            entity.Property(user => user.PasswordHash).IsRequired();
            entity.Property(user => user.FullName).HasMaxLength(200).IsRequired();
            entity.Property(user => user.Company).HasMaxLength(200).IsRequired();
            entity.Property(user => user.LegalEntities).HasColumnType("jsonb");
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.ToTable("contracts");
            entity.HasKey(contract => contract.Id);
            entity.Property(contract => contract.Id).HasMaxLength(64);
            entity.Property(contract => contract.LegalEntity).HasMaxLength(200).IsRequired();
            entity.Property(contract => contract.Supplier).HasMaxLength(200).IsRequired();
            entity.Property(contract => contract.ContractDate).HasMaxLength(32).IsRequired();
            entity.Property(contract => contract.FactualBalance).HasMaxLength(64).IsRequired();
            entity.Property(contract => contract.ContractCurrency).HasMaxLength(8).IsRequired();
        });
    }
}
