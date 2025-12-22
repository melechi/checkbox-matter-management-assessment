import { describe, beforeEach, it, expect } from 'vitest';
import { CycleTimeService } from '../service/cycle_time_service.js';
import { MATTER_STATUS_GROUP_NAME, MatterStatusGroupName, SLAStatus } from '../../types.js';

class TestCycleTimeService extends CycleTimeService {
    public testFormatDuration(_durationMs: number, _isInProgress: boolean):string {
        return this._formatDuration(_durationMs,_isInProgress);
    }

    public testFormatSLAResponse(_currentStatusGroupName: MatterStatusGroupName | null, _resolutionTimeMs: number):SLAStatus {
        return this._formatSLAResponse(_currentStatusGroupName,_resolutionTimeMs);
    }
    
}

const minute = 60 * 1000;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365;

describe('_formatDuration', () => {
    let service: TestCycleTimeService;

    beforeEach(() => {
      service = new TestCycleTimeService();
    });
    
    it('formats hours and minutes correctly', () => {
      // 2 hours 30 minutes in ms
      const result = service.testFormatDuration(hour * 2.5, false);
      expect(result).toBe('2h 30m');
    });
    
    it('formats days, hours and minutes correctly', () => {
      // 1 day, 2 hours, 30 minutes
      const result = service.testFormatDuration(day + hour * 2.5, false);
      expect(result).toBe('1d 2h 30m');
    });
    
    it('formats years, days, hours and minutes correctly', () => {
      // 1 year, 1 day, 2 hours, 30 minutes
      const result = service.testFormatDuration(year + day + hour * 2.5, false);
      expect(result).toBe('1y 1d 2h 30m');
    });

    it('adds "In Progress" prefix when in progress', () => {
      const result = service.testFormatDuration(3600000, true);
      expect(result).toBe('In Progress: 1h');
    });

    it('Less than 1 minute should format as empty', () => {
      const result = service.testFormatDuration(59000, true);
      expect(result).toBe('');
    });

    it('Zero should format as empty', () => {
      const result = service.testFormatDuration(0, true);
      expect(result).toBe('');
    });

    it('At least 1 minute to display something', () => {
      const result = service.testFormatDuration(60000, true);
      expect(result).toBe('In Progress: 1m');
    });
});

describe('_formatSLAResponse', () => {
    let service: TestCycleTimeService;

    beforeEach(() => {
      service = new TestCycleTimeService();
    });
   
   
    it('returns expected SLA "In Progress" when "To Do" and UNDER sla threashold', () => {
      // To Do, 10 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.TODO, hour);
      expect(result).toBe('In Progress');
    });

    it('returns expected SLA "In Progress" when "To Do" and OVER sla threashold', () => {
      // To Do, 10 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.TODO, hour*10);
      expect(result).toBe('In Progress');
    });

    it('returns expected SLA "In Progress" when "In Progress" and UNDER sla threashold', () => {
      // In Progress, 1 hour cycletime.
        const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.IN_PROGRESS, hour);
      expect(result).toBe('In Progress');
    });
   
    it('returns expected SLA "In Progress" when "In Progress" and OVER sla threashold', () => {
      // In Progress, 10 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.IN_PROGRESS, hour*10);
      expect(result).toBe('In Progress');
    });
   
    it('returns expected SLA "Met" when "Done" and UNDER sla threashold', () => {
      // Done, 7 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.DONE, hour*7);
      expect(result).toBe('Met');
    });
   
    it('returns expected SLA "Met" when "Done" and EXACTLY sla threashold', () => {
      // Done, 8 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.DONE, hour*8);
      expect(result).toBe('Met');
    });
   
    it('returns expected SLA "Breached" when "Done" and OVER sla threashold', () => {
      // Done, 8.1 hour cycletime.
      const result = service.testFormatSLAResponse(MATTER_STATUS_GROUP_NAME.DONE, hour*8.1);
      expect(result).toBe('Breached');
    });
});