namespace WebCafe.Backend.Infrastructure.Storage
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads");
        Task<bool> DeleteFileAsync(string fileUrl);
    }

    public class LocalFileSystemStorage : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;

        public LocalFileSystemStorage(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string subFolder = "uploads")
        {
            if (file == null || file.Length == 0) return string.Empty;

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(webRoot, subFolder);
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var fullPath = Path.Combine(uploadDir, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/{subFolder}/{fileName}".Replace("\\", "/");
        }

        public Task<bool> DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return Task.FromResult(false);

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var relativePath = fileUrl.TrimStart('/');
            var fullPath = Path.Combine(webRoot, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }
}
