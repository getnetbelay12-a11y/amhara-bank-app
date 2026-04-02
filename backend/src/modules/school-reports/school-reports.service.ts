import { Injectable } from '@nestjs/common';

@Injectable()
export class SchoolReportsService {
  getCollectionsSummary() {
    return {
      generatedAt: '2026-03-10T12:00:00.000Z',
      schools: 2,
      totalStudents: 2100,
      totalInvoices: 525,
      collectionsToday: 277700,
      arrearsAmount: 13200,
      settlementPendingAmount: 1200,
    };
  }
}
