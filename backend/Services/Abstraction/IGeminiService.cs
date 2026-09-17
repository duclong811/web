using WebCafe.Backend.Models.DTOs.AI;

namespace WebCafe.Backend.Services.Abstraction
{
    public interface IGeminiService
    {
        Task<AiRecommendationResponseDto> GetSmartRecommendationsAsync(AiRecommendationRequestDto request);
        Task<AiChatResponseDto> ChatWithSommelierAsync(AiChatRequestDto request);
    }
}
