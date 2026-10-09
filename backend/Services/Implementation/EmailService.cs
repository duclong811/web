using System.Net;
using System.Net.Mail;
using WebCafe.Backend.Services.Abstraction;

namespace WebCafe.Backend.Services.Implementation;

public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(string recipient, string verificationUrl, CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:SmtpHost"];
        var from = _configuration["Email:From"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            if (string.Equals(_configuration["ASPNETCORE_ENVIRONMENT"], "Production", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Email SMTP chưa được cấu hình ở Production.");
            _logger.LogWarning("Email SMTP chưa cấu hình. Verification URL cho {Recipient}: {VerificationUrl}", recipient, verificationUrl);
            return;
        }

        using var client = new SmtpClient(host, _configuration.GetValue<int?>("Email:SmtpPort") ?? 587)
        {
            EnableSsl = _configuration.GetValue("Email:EnableSsl", true),
            Credentials = new NetworkCredential(_configuration["Email:Username"] ?? from, _configuration["Email:Password"] ?? string.Empty)
        };
        using var message = new MailMessage(from, recipient)
        {
            Subject = "Xác minh email AI-SMARTSERVE",
            Body = $"Chào bạn,\n\nBấm vào liên kết sau để xác minh email và bắt đầu dùng thử 14 ngày:\n{verificationUrl}\n\nLiên kết có hiệu lực trong 24 giờ.",
            IsBodyHtml = false
        };
        await client.SendMailAsync(message, cancellationToken);
    }
}
