// Notification Sound Service
class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Create audio element with notification sound
    // Using a simple beep sound data URL (you can replace with your own sound file)
    this.audio = new Audio();
    // Simple notification beep (base64 encoded short beep)
    this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8xkNbx0IJqOgstdMjw3qBJEBdjrOvwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ==';
    this.audio.volume = 0.5;
  }

  playNewOrderSound() {
    if (!this.isEnabled || !this.audio) return;
    
    try {
      // Reset audio to start
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  playStatusChangeSound() {
    if (!this.isEnabled || !this.audio) return;
    
    try {
      this.audio.volume = 0.3; // Softer for status changes
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.warn('Could not play status sound:', err);
      });
      // Reset volume
      setTimeout(() => {
        if (this.audio) this.audio.volume = 0.5;
      }, 100);
    } catch (error) {
      console.error('Error playing status sound:', error);
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  isNotificationEnabled() {
    return this.isEnabled;
  }
}

export const notificationService = new NotificationService();
