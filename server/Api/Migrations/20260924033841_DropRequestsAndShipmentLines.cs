using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class DropRequestsAndShipmentLines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shipment_lines");

            migrationBuilder.DropTable(
                name: "requests");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "requests",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Direction = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LegalEntity = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LogisticsType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Nomenclature = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RequestContract = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    RequestDate = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    RequestStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Supplier = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PowerOfAttorney = table.Column<string>(type: "jsonb", nullable: true),
                    VehicleInfo = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "shipment_lines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RequestId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Amount = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    LineNumber = table.Column<int>(type: "integer", nullable: false),
                    Nomenclature = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Price = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Quantity = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Shipped = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Warehouse = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
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
        }
    }
}
