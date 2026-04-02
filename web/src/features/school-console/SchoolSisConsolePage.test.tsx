import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AppClientContext } from '../../app/AppContext';
import { createDemoAppClient } from '../../core/api/appClient';
import type { SchoolSession } from '../../core/session';
import { SchoolSisConsolePage } from './SchoolSisConsolePage';

const session: SchoolSession = {
  sessionType: 'school',
  userId: 'school_admin_1',
  fullName: 'School Admin',
  schoolId: 'school_blue_nile',
  schoolName: 'Blue Nile Academy',
  roleLabel: 'School Admin',
  branchName: 'Bahir Dar Branch',
};

afterEach(() => {
  cleanup();
});

describe('SchoolSisConsolePage', () => {
  it('renders dashboard KPIs and collection chart', async () => {
    render(
      <AppClientContext.Provider value={createDemoAppClient()}>
        <SchoolSisConsolePage session={session} section="schoolDashboard" />
      </AppClientContext.Provider>,
    );

    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Collection trend')).toBeInTheDocument();
    expect(screen.getByText('Quick actions')).toBeInTheDocument();
  });

  it('renders students registry tools', async () => {
    render(
      <AppClientContext.Provider value={createDemoAppClient()}>
        <SchoolSisConsolePage session={session} section="schoolStudents" />
      </AppClientContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Student registry')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Add student' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });
});
