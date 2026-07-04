import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Create or fetch a chat room between two users (e.g. for a freelance contract) */
  async createOrGetRoom(userId1: string, userId2: string, contractId?: string) {
    if (contractId) {
      const existing = await this.prisma.chatRoom.findUnique({
        where: { contractId },
        include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } }
      });
      if (existing) return existing;
    }
    
    // Create new room
    const room = await this.prisma.chatRoom.create({
      data: {
        contractId,
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }]
        }
      },
      include: { participants: true, messages: true }
    });
    
    this.logger.log(`Created new ChatRoom ${room.id} for users ${userId1} and ${userId2}`);
    return room;
  }

  /** Save a message to DB and return it populated */
  async saveMessage(roomId: string, senderId: string, content: string) {
    // Verify user is in room
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId: senderId } }
    });
    if (!participant) throw new NotFoundException('User is not a participant of this chat room');

    return this.prisma.message.create({
      data: {
        roomId,
        senderId,
        content
      },
      include: { 
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } 
      }
    });
  }

  /** List chat rooms for a user */
  async getUserRooms(userId: string) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            messages: { take: 1, orderBy: { createdAt: 'desc' } },
            participants: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return participants.map((p) => ({
      id: p.room.id,
      contractId: p.room.contractId,
      gigTitle: p.room.contractId ? `Contract ${p.room.contractId.substring(0, 8)}` : 'Conversation',
      participants: p.room.participants.map((part) => part.user),
      lastMessage: p.room.messages[0] ?? null,
    }));
  }

  /** Fetch message history */
  async getRoomMessages(roomId: string, userId: string, take = 50) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });
    if (!participant) throw new NotFoundException('Unauthorized');

    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' }, // usually UI wants asc, but depends on frontend
      take,
      include: { 
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } 
      }
    });
  }
}
