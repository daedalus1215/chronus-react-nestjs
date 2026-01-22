import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  TextToSpeechRequestDto,
  TextToSpeechResponseDto,
} from 'src/audio/apps/dtos/requests/text-to-speech.dto';
import { AudioResponse } from 'src/audio/apps/dtos/responses/audio.response.dto';
import { TextToSpeechTransactionScript } from '../transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from '../transaction-scripts/download-audio.transaction.script';
import { NoteMemoTagRepository } from 'src/notes/infra/repositories/note-memo-tag.repository';
import { MemoRepository } from 'src/notes/infra/repositories/memo.repository';

@Injectable()
export class AudioService {
  constructor(
    private readonly textToSpeechTS: TextToSpeechTransactionScript,
    private readonly downloadAudioTS: DownloadAudioTransactionScript,
    private readonly noteRepository: NoteMemoTagRepository,
    private readonly memoRepository: MemoRepository
  ) {}

  async convertTextToSpeech(
    request: TextToSpeechRequestDto & { userId: number }
  ): Promise<TextToSpeechResponseDto> {
    const { noteId, memoId, userId } = request;

    // Fetch the note to verify ownership
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Get memos for the note
    const memos = note.memos || [];
    if (memos.length === 0) {
      throw new BadRequestException(
        'Note has no memos. Text-to-speech is only available for notes with memos.'
      );
    }

    // Determine which memo to use
    let targetMemo;
    if (memoId) {
      // Find the specific memo
      targetMemo = memos.find(m => m.id === memoId);
      if (!targetMemo) {
        throw new NotFoundException(
          `Memo with ID ${memoId} not found in note ${noteId}`
        );
      }
    } else {
      // Use the first memo if no memoId specified
      if (memos.length > 1) {
        throw new BadRequestException(
          'Note has multiple memos. Please specify which memo to convert using memoId.'
        );
      }
      targetMemo = memos[0];
    }

    return this.textToSpeechTS.execute({
      ...request,
      text: targetMemo.description,
      // assetId: noteId, // Keep assetId for backward compatibility with remote caller
    });
  }

  async downloadAudio(userId: number, assetId: string): Promise<AudioResponse> {
    return this.downloadAudioTS.execute(userId, assetId);
  }
}
