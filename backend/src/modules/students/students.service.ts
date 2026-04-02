import { ForbiddenException, Injectable } from '@nestjs/common';

import { UserRole } from '../../common/enums';
import { AuthenticatedUser } from '../auth/interfaces';
import { GuardianStudentLinksService } from '../guardian-student-links/guardian-student-links.service';

import { CreateStudentDto } from './dto/create-student.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { StudentRegistryQueryDto } from './dto/student-registry-query.dto';

type StudentRegistryItem = {
  schoolId: string;
  studentId: string;
  fullName: string;
  grade: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
  status: string;
};

const STUDENT_FIXTURES: StudentRegistryItem[] = [
  {
    schoolId: 'school_blue_nile',
    studentId: 'ST-1001',
    fullName: 'Bethel Alemu',
    grade: 'Grade 7',
    section: 'A',
    guardianName: 'Alemu Bekele',
    guardianPhone: '0911000001',
    status: 'active',
  },
  {
    schoolId: 'school_blue_nile',
    studentId: 'ST-1002',
    fullName: 'Mahlet Tadesse',
    grade: 'Grade 9',
    section: 'B',
    guardianName: 'Tadesse Worku',
    guardianPhone: '0911000007',
    status: 'active',
  },
  {
    schoolId: 'school_tana',
    studentId: 'ST-2001',
    fullName: 'Yohannes Kassahun',
    grade: 'Grade 5',
    section: 'C',
    guardianName: 'Kassahun Molla',
    guardianPhone: '0911000008',
    status: 'pending_billing',
  },
];

@Injectable()
export class StudentsService {
  private readonly students = [...STUDENT_FIXTURES];

  constructor(
    private readonly guardianStudentLinksService: GuardianStudentLinksService,
  ) {}

  list(schoolId?: string) {
    return this.listRegistry({ schoolId });
  }

  listRegistry(query: StudentRegistryQueryDto = {}) {
    const search = query.search?.trim().toLowerCase();

    return this.students.filter((item) => {
      if (query.schoolId && item.schoolId !== query.schoolId) {
        return false;
      }

      if (query.grade && item.grade !== query.grade) {
        return false;
      }

      if (query.section && item.section !== query.section) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      if (
        search &&
        ![item.studentId, item.fullName, item.guardianName, item.guardianPhone]
          .join(' ')
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }

      return true;
    });
  }

  listLinkedToGuardian(currentUser: AuthenticatedUser) {
    if (
      currentUser.role !== UserRole.MEMBER &&
      currentUser.role !== UserRole.SHAREHOLDER_MEMBER
    ) {
      throw new ForbiddenException('Only member users can access linked students.');
    }

    if (!currentUser.customerId) {
      return [];
    }

    const linkedStudentIds = new Set<string>();

    return this.guardianStudentLinksService
      .listByMemberCustomerId(currentUser.customerId)
      .then((links) => {
        for (const item of links) {
          linkedStudentIds.add(item.studentId);
        }

        return this.students.filter((item) => linkedStudentIds.has(item.studentId));
      });
  }

  getOverview() {
    const students = this.students.length;
    const active = this.students.filter((item) => item.status === 'active').length;
    const pendingBilling = this.students.filter(
      (item) => item.status === 'pending_billing',
    ).length;

    return {
      totals: {
        students,
        active,
        pendingBilling,
        guardiansLinked: this.students.filter((item) => item.guardianPhone).length,
      },
      students: this.students,
    };
  }

  create(payload: CreateStudentDto) {
    const item: StudentRegistryItem = {
      schoolId: payload.schoolId,
      studentId: payload.studentId,
      fullName: payload.fullName,
      grade: payload.grade ?? 'Unassigned',
      section: payload.section ?? 'Unassigned',
      guardianName: payload.guardianName ?? 'Pending guardian',
      guardianPhone: payload.guardianPhone ?? '',
      status: 'active',
    };

    this.students.unshift(item);
    return item;
  }

  importStudents(payload: ImportStudentsDto) {
    const created = payload.students.map((student) => {
      const item: StudentRegistryItem = {
        schoolId: payload.schoolId,
        studentId: student.studentId,
        fullName: student.fullName,
        grade: student.grade ?? 'Unassigned',
        section: student.section ?? 'Unassigned',
        guardianName: student.guardianName ?? 'Pending guardian',
        guardianPhone: student.guardianPhone ?? '',
        status: 'active',
      };

      this.students.unshift(item);
      return item;
    });

    return {
      schoolId: payload.schoolId,
      importedCount: created.length,
      message: `Imported ${created.length} students into ${payload.schoolId}.`,
      items: created,
    };
  }
}
