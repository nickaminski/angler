import { Injectable } from '@angular/core';
import { hub_Url, api_url } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { LoggerService } from './logger.service';
import { GuidService } from './guid.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiPath = `${api_url}/Chat`;
  private hubConnection: HubConnection;

  private setUpChannelsSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $setUpChannels: Observable<boolean>;

  private connectedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $Connected: Observable<boolean>;

  public Connecting: boolean;

  private joinSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public $Join: Observable<boolean>;

  private messageSubject: BehaviorSubject<ChatPacket> = new BehaviorSubject<ChatPacket>(null);
  public $messageReceived: Observable<ChatPacket>;

  private _currentChatRoom: ChatRoomMetaData;

  private currentMessagesSubject: BehaviorSubject<ChatPacket[]> = new BehaviorSubject<ChatPacket[]>([]);
  public $currentMessages: Observable<ChatPacket[]>;

  get Messages():ChatPacket[][] {
    return this._messages;
  }

  get AvailableChatRooms(): ChatRoomMetaData[] {
    return this._availableChatRooms;
  }

  get CurrentchatRoom(): ChatRoomMetaData {
    return this._currentChatRoom;
  }

  private _messages: ChatPacket[][];
  private _availableChatRooms: ChatRoomMetaData[];

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

  constructor(private logger: LoggerService, private guidService: GuidService, private httpClient: HttpClient) {
    this.$Connected = this.connectedSubject.asObservable();
    this.$messageReceived = this.messageSubject.asObservable();
    this.$Join = this.joinSubject.asObservable();
    this.$setUpChannels = this.setUpChannelsSubject.asObservable();
    this.$currentMessages = this.currentMessagesSubject.asObservable();
    this.hubConnection = new HubConnectionBuilder().withUrl(hub_Url).build();

    this._messages = [];

    this.getChatRoomList().subscribe(response => {
      this._availableChatRooms = response;
      this._currentChatRoom = this._availableChatRooms.find(x => x.name == 'Public' && x.ownerUserId == 'system');

      this.getChatRoomChannelHistory(this._currentChatRoom.id).subscribe(response => {
        this._messages[this._currentChatRoom.id] = response;
        this.currentMessagesSubject.next(response);
      });
    });
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
      this.Messages[this._currentChatRoom.id].push(packet);
      this.currentMessagesSubject.next(this.Messages[this._currentChatRoom.id]);
      this.connectedSubject.next(false);
      this.logger.logError('here is the erorr: ' + error);
    });
  }

  public joinChannel(channelId: string) {
    this.hubConnection.invoke('joinChannel', channelId)
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

  public listenForMessages() {
    this.hubConnection.on('broadcastToChannel', (chatPacket : ChatPacket) => {
      this.messageSubject.next(chatPacket);
      this.Messages[chatPacket.channelId].push(chatPacket);
      this.currentMessagesSubject.next(this.Messages[this._currentChatRoom.id]);
    });
  }

  public sendMessage(packet: ChatPacket) {
    packet.channelId = this._currentChatRoom.id;
    this.hubConnection.invoke('sendMessageToChannel', packet)
                      .then(() => this.logger.logInfo(`message sent`))
                      .catch(err => this.logger.logError(`Error sending message: ${err}`));
  }

  public setUpChannels(userId: string) {
    this.hubConnection.invoke('setUpChannels', userId)
                      .then(() => this.setUpChannelsSubject.next(true))
                      .catch(err => this.logger.logError('error initializing user'));
  }

  public getChatRoomList(): Observable<ChatRoomMetaData[]>{
    return this.httpClient.get<ChatRoomMetaData[]>(`${this.apiPath}/GetChatRoomList`);
  }

  public getChatRoomChannelHistory(chatRoomId: string): Observable<ChatPacket[]> {
    return this.httpClient.get<ChatPacket[]>(`${this.apiPath}/GetChatRoomChannelHistory?id=${chatRoomId}`);
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

export interface ChatRoomMetaData {
  id: string;
  name: string
  createdDate: Date;
  ownerUserId: string;
  userIds: string[];
}

export interface ChatRoom {
  chatRoomMetaData: ChatRoomMetaData;
  chatHistory: ChatPacket[];
}