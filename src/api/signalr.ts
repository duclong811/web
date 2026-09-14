import * as signalR from '@microsoft/signalr';
import { HUB_URL } from './apiClient';
import type { OrderDto } from '../types/apiTypes';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(storeId?: number, tableId?: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = localStorage.getItem('token');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');

      if (storeId) {
        await this.connection.invoke('JoinStoreGroup', storeId);
      }
      if (tableId) {
        await this.connection.invoke('JoinTableGroup', tableId);
      }
    } catch (err) {
      console.error('SignalR connection error: ', err);
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
