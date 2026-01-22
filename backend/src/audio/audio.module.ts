import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextToSpeechAction } from './apps/actions/text-to-speech/text-to-speech.action';
import { DownloadAudioAction } from './apps/actions/download-audio/download-audio.action';
import { AudioService } from './domain/services/audio.service';
import { TextToSpeechTransactionScript } from './domain/transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from './domain/transaction-scripts/download-audio.transaction.script';
import { HermesRemoteCaller } from './infrastructure/remote-callers/hermes.remote-caller';
import { NotesModule } from 'src/notes/notes.module';
import { Memo } from 'src/notes/domain/entities/notes/memo.entity';
import { MemoRepository } from 'src/notes/infra/repositories/memo.repository';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    NotesModule,
    TypeOrmModule.forFeature([Memo]),
  ],
  controllers: [TextToSpeechAction, DownloadAudioAction],
  providers: [
    AudioService,
    TextToSpeechTransactionScript,
    DownloadAudioTransactionScript,
    HermesRemoteCaller,
    MemoRepository,
  ],
  exports: [AudioService],
})
export class AudioModule {}
