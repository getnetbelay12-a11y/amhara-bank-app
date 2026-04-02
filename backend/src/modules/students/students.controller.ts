import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { AuthenticatedUser } from '../auth/interfaces';
import { CreateStudentDto } from './dto/create-student.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { StudentRegistryQueryDto } from './dto/student-registry-query.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  list(@Query() query: StudentRegistryQueryDto) {
    return this.studentsService.listRegistry(query);
  }

  @Get('overview')
  getOverview() {
    return this.studentsService.getOverview();
  }

  @UseGuards(JwtAuthGuard)
  @Get('linked/me')
  getLinkedStudents(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.studentsService.listLinkedToGuardian(currentUser);
  }

  @Post()
  create(@Body() payload: CreateStudentDto) {
    return this.studentsService.create(payload);
  }

  @Post('import')
  importStudents(@Body() payload: ImportStudentsDto) {
    return this.studentsService.importStudents(payload);
  }
}
