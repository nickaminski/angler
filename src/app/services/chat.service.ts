import { Injectable } from '@angular/core';
import { hub_Url } from 'src/environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { LoggerService } from './logger.service';
import { GuidService } from './guid.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private hubConnection: HubConnection;

  public setUpChannelsSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public setUpChannelsObservable: Observable<boolean>;

  private connectedSubject: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public ConnectedObservable: Observable<boolean>;

  public Connecting: boolean;

  private joinSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public JoinObservable: Observable<boolean>;

  private messageSubject: BehaviorSubject<ChatPacket> = new BehaviorSubject<ChatPacket>(null);
  public MessageObservable: Observable<ChatPacket>;

  public CurrentChatRoom: string;

  get Messages():ChatPacket[][] {
    return this._messages;
  }

  private _messages: ChatPacket[][];

  private getNewServerDisconnectPacket(): ChatPacket {
    return {
      id: this.guidService.newGuid(),
      message: 'Disconnected',
      timestamp: new Date().getTime(),
      username: 'System',
      channelId: 'all',
      userId: '-1'
    };
  };

  constructor(private logger: LoggerService, private guidService: GuidService) {
    this.ConnectedObservable = this.connectedSubject.asObservable();
    this.MessageObservable = this.messageSubject.asObservable();
    this.JoinObservable = this.joinSubject.asObservable();
    this.setUpChannelsObservable = this.setUpChannelsSubject.asObservable();
    this.hubConnection = new HubConnectionBuilder().withUrl(hub_Url).build();

    this.CurrentChatRoom = 'public';
    this._messages = [];
    this._messages[this.CurrentChatRoom] = [];
  }

  public startConnection() {
    if (this.Connecting) return;

    this.Connecting = true;

    this.hubConnection.start()
                      .then(() => this.connectedSubject.next(true))
                      .catch(err => this.logger.logError(`Error while starting connection: ${err}`))
                      .finally(() => this.Connecting = false);

    this.hubConnection.onclose((error: Error) => {
      const packet = this.getNewServerDisconnectPacket();
      this.messageSubject.next(packet);
      this.Messages[this.CurrentChatRoom].push(packet);
      this.connectedSubject.next(false);
      this.logger.logError('here is the erorr: ' + error);
    });
  }

  public joinChannel(channelName: string) {
    this.hubConnection.invoke('joinChannel', channelName)
                      .then((response : boolean) => {
                          this.joinSubject.next(response);
                        }
                      )
                      .catch(err => {
                        this.logger.logError(`Error while joining channel: ${err}`); 
                        this.joinSubject.next(false);
                      });
  }

  public isInitialized(): boolean {
    return this.setUpChannelsSubject.getValue();
  }

  /*
  public leaveChannel(channelName: string) {
    this.hubConnection.invoke('leaveChannel', channelName)
                      .then((response : boolean) => {
                          this.logger.log(`left channel with success of: ${response}`);
                        }
                      )
                      .catch(err => this.logger.log(`Error when leaving channel: ${err}`))
  }
  */

  public listenForMessages() {
    this.hubConnection.on('broadcastToChannel', (chatPacket : ChatPacket) => {
      this.messageSubject.next(chatPacket);
      this.Messages[chatPacket.channelId].push(chatPacket);
    });
  }

  public sendMessage(packet: ChatPacket) {
    packet.channelId = this.CurrentChatRoom;
    this.hubConnection.invoke('sendMessageToChannel', packet)
                      .then(() => this.logger.logInfo(`message sent`))
                      .catch(err => this.logger.logError(`Error sending message: ${err}`));
  }

  public setUpChannels(userId: string) {
    this.hubConnection.invoke('setUpChannels', userId)
                      .then(() => this.setUpChannelsSubject.next(true))
                      .catch(err => this.logger.logError('error initializing user'));
  }

}

export interface ChatPacket {
  id: string;
  message: string;
  channelId: string;
  timestamp: number;
  username: string;
  userId: string;
}
