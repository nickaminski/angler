import { Component, Input, OnInit } from '@angular/core';
import { ChatPacket } from '../../services/chat.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: ChatPacket;
  @Input() selectedUserId: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
