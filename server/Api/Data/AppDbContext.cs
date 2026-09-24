using Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<ShipmentLine> ShipmentLines => Set<ShipmentLine>();

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
            entity.Property(contract => contract.ContractDate).HasMaxLength(32).IsRequired();
            entity.Property(contract => contract.FactualBalance).HasMaxLength(64).IsRequired();
            entity.Property(contract => contract.ContractCurrency).HasMaxLength(8).IsRequired();
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.ToTable("requests");
            entity.HasKey(request => request.Id);
            entity.Property(request => request.Id).HasMaxLength(64);
            entity.Property(request => request.RequestDate).HasMaxLength(32).IsRequired();
            entity.Property(request => request.RequestStatus).HasMaxLength(100).IsRequired();
            entity.Property(request => request.RequestContract).HasMaxLength(64).IsRequired();
            entity.Property(request => request.LegalEntity).HasMaxLength(200).IsRequired();
            entity.Property(request => request.Supplier).HasMaxLength(200).IsRequired();
            entity.Property(request => request.Nomenclature).HasMaxLength(200).IsRequired();
            entity.Property(request => request.Direction).HasMaxLength(500).IsRequired();
            entity.Property(request => request.ContactPhone).HasMaxLength(32);
            entity.Property(request => request.LogisticsType).HasMaxLength(32);
            entity.OwnsOne(request => request.PowerOfAttorney, poa =>
            {
                poa.ToJson();
                poa.OwnsOne(item => item.Attachment);
            });
            entity.OwnsOne(request => request.VehicleInfo, vehicle =>
            {
                vehicle.ToJson();
            });
            entity.HasMany(request => request.ShipmentLines)
                .WithOne(line => line.Request)
                .HasForeignKey(line => line.RequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShipmentLine>(entity =>
        {
            entity.ToTable("shipment_lines");
            entity.HasKey(line => line.Id);
            entity.Property(line => line.RequestId).HasMaxLength(64).IsRequired();
            entity.Property(line => line.Warehouse).HasMaxLength(200).IsRequired();
            entity.Property(line => line.Nomenclature).HasMaxLength(500).IsRequired();
            entity.Property(line => line.Quantity).HasMaxLength(64).IsRequired();
            entity.Property(line => line.Shipped).HasMaxLength(64).IsRequired();
            entity.Property(line => line.Price).HasMaxLength(64).IsRequired();
            entity.Property(line => line.Amount).HasMaxLength(64).IsRequired();
        });
    }
}
