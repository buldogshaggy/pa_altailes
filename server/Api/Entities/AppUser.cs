namespace Api.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public List<string> LegalEntities { get; set; } = [];
}
