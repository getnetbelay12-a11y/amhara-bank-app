import { Module } from '@nestjs/common';

import { GuardianStudentLinksModule } from '../guardian-student-links/guardian-student-links.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [GuardianStudentLinksModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
