// courses.module.ts
import { Module } from '@nestjs/common';
import { DBSchemas } from 'libs/schema/src';
import { CourcesController } from './courses.controller';
import { CourcesService } from './courses.service';

@Module({
  imports: [DBSchemas.cources],
  controllers: [CourcesController],
  providers: [CourcesService],
})
export class CourcesModule {}
