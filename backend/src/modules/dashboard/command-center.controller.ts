import { Controller, Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces';
import { DashboardPeriodQueryDto } from './dto';
import { PerformanceService } from './performance.service';

@Controller('manager/command-center')
export class CommandCenterController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('head-office')
  getHeadOfficeSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.performanceService.getHeadOfficeSummary(currentUser, query);
  }

  @Get('district')
  getDistrictSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.performanceService.getDistrictSummary(currentUser, query);
  }

  @Get('branch')
  getBranchSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: DashboardPeriodQueryDto,
  ) {
    return this.performanceService.getBranchSummary(currentUser, query);
  }
}
