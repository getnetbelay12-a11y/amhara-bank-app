import { Module } from '@nestjs/common';

import { FeePlansModule } from '../fee-plans/fee-plans.module';
import { StudentsModule } from '../students/students.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [FeePlansModule, StudentsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
