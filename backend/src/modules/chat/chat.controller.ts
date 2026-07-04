import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getRooms(@CurrentUser() user: CurrentUserPayload) {
    return this.chatService.getUserRooms(user.userId);
  }

  @Get('rooms/:roomId/messages')
  getMessages(
    @Param('roomId') roomId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatService.getRoomMessages(roomId, user.userId);
  }
}
