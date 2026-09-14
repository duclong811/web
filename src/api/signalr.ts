import * as signalR from '@microsoft/signalr';
import { HUB_URL } from './apiClient';
import type { OrderDto } from '../types/apiTypes';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(storeId?: number, tableId?: number) {
    // If already connected or connecting, skip
    if (this.connection) {
      const state = this.connection.state;
      if (state === signalR.HubConnectionState.Connected || state === signalR.HubConnectionState.Connecting) {
        console.log(`⏭️ SignalR already ${state}, skipping...`);
        return;
      }
    }

    const token = localStorage.getItem('token');

    // Build connection with proper configuration
    const hubOptions: signalR.IHttpConnectionOptions = {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
    };

    if (token) {
      hubOptions.accessTokenFactory = () => token;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, hubOptions)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    try {
      await this.connection.start();
      console.log('✅ SignalR connected successfully');

      if (storeId) {
        await this.connection.invoke('JoinStoreGroup', storeId);
        console.log(`✅ Joined store group: ${storeId}`);
      }
      if (tableId) {
        await this.connection.invoke('JoinTableGroup', tableId);
        console.log(`✅ Joined table group: ${tableId}`);
      }
    } catch (err) {
      console.error('❌ SignalR connection error:', err);
      // Don't throw - allow app to continue without realtime
    }
  }

  public onNewOrder(callback: (order: OrderDto) => void) {
    if (this.connection) {
      this.connection.on('NewOrderReceived', callback);
    }
  }

  public onOrderStatusChanged(callback: (orderId: number, status: string, orderCode: string) => void) {
    if (this.connection) {
      this.connection.on('OrderStatusChanged', callback);
    }
  }

  public onTableStatusChanged(callback: (tableId: number, status: string) => void) {
    if (this.connection) {
      this.connection.on('TableStatusChanged', callback);
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

// Default export
export default new SignalRService();

// Named export
export const signalRService = new SignalRService();
