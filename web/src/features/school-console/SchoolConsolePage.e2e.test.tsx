import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppClientContext } from '../../app/AppContext';
import { createDemoAppClient } from '../../core/api/appClient';
import type { SchoolSession } from '../../core/session';
import { SchoolConsolePage } from './SchoolConsolePage';

const session: SchoolSession = {
  sessionType: 'school',
  userId: 'school_admin_1',
  fullName: 'School Admin',
  schoolId: 'school_blue_nile',
  schoolName: 'Blue Nile Academy',
  roleLabel: 'School Admin',
  branchName: 'Bahir Dar Branch',
};

describe('school console E2E flow', () => {
  it('shows settlement by school and updates it from collections filters', async () => {
    const user = userEvent.setup();

    render(
      <AppClientContext.Provider value={createDemoAppClient()}>
        <SchoolConsolePage session={session} />
      </AppClientContext.Provider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Collections' }));

    await screen.findByText('Settlement by school');
    expect(screen.getByText('Blue Nile Academy')).toBeInTheDocument();
    expect(screen.getByText('Lake Tana Preparatory School')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Reconciliation'), 'awaiting_settlement');

    await waitFor(() => {
      expect(screen.getByText('Lake Tana Preparatory School')).toBeInTheDocument();
      expect(screen.queryByText('Blue Nile Academy')).not.toBeInTheDocument();
    });

    const schoolRow = screen.getByText('Lake Tana Preparatory School').closest('tr');
    expect(schoolRow).not.toBeNull();
    if (!schoolRow) {
      throw new Error('Expected Lake Tana settlement row to be rendered.');
    }

    const scopedQueries = within(schoolRow);
    expect(scopedQueries.getAllByText('ETB 1,200')).toHaveLength(2);
    expect(scopedQueries.getAllByText('1')).toHaveLength(2);
  });
});
