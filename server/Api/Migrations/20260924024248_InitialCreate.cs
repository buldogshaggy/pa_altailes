using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "contracts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    LegalEntity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContractDate = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    FactualBalance = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ContractCurrency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contracts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "requests",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    RequestDate = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    RequestStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequestContract = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    LegalEntity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Supplier = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Nomenclature = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Direction = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    LogisticsType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    PowerOfAttorney = table.Column<string>(type: "jsonb", nullable: true),
                    VehicleInfo = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Login = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LegalEntities = table.Column<List<string>>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "shipment_lines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RequestId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    Warehouse = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Nomenclature = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Quantity = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Shipped = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Price = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Amount = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipment_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shipment_lines_requests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "requests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_shipment_lines_RequestId",
                table: "shipment_lines",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Login",
                table: "users",
                column: "Login",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "contracts");

            migrationBuilder.DropTable(
                name: "shipment_lines");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "requests");
        }
    }
}
