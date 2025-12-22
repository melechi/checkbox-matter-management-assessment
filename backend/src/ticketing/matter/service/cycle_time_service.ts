import { config } from '../../../utils/config.js';
import { SLAStatus, SLA_STATUS_NAMES, CycleTime, MatterStatusGroupName, MATTER_STATUS_GROUP_NAME, Matter } from '../../types.js';
import { formatDuration, intervalToDuration } from 'date-fns';

/**
 * CycleTimeService - Calculate resolution times and SLA status for matters
 * 
 * TODO: Implement this service to:
 * 1. Calculate resolution time from "To Do" → "Done" status transitions
 * 2. Determine SLA status based on resolution time vs threshold
 * 3. Format durations in human-readable format (e.g., "2h 30m", "3d 5h")
 * 
 * Requirements:
 * - Query ticketing_cycle_time_histories table
 * - Join with status groups to identify "To Do", "In Progress", "Done" statuses
 * - Calculate time between first transition and "Done" transition
 * - For in-progress matters, calculate time from first transition to now
 * - Compare against SLA_THRESHOLD_HOURS (default: 8 hours)
 * 
 * SLA Status Logic:
 * - "In Progress": Matter not yet in "Done" status
 * - "Met": Resolved within threshold (≤ 8 hours)
 * - "Breached": Resolved after threshold (> 8 hours)
 * 
 * Consider:
 * - Performance for 10,000+ matters
 * - Caching strategies for high load
 * - Database query optimization
 */
export class CycleTimeService {
  // SLA threshold in milliseconds (candidates will use this in their implementation)
  private _slaThresholdMs: number;

  constructor() {
    this._slaThresholdMs = config.SLA_THRESHOLD_HOURS * 60 * 60 * 1000;
  }

  async calculateCycleTimeAndSLA(
    _matter: Matter,
    _currentStatusGroupName:MatterStatusGroupName | null,
  ): Promise<{ cycleTime: CycleTime; sla: SLAStatus }> {
      let cycleTime:CycleTime = {
        resolutionTimeMs: null,
        resolutionTimeFormatted: 'N/A',
        isInProgress: true,
        startedAt: null,
        completedAt: null,
      }
      let sla:SLAStatus = SLA_STATUS_NAMES.IN_PROGRESS;

      // If we don't have transition times. Return the above defaults.
      if (!_matter.transitionedFirst || !_matter.transitionedLast) {
        return { cycleTime, sla };
      }
      
      const first = _matter.transitionedFirst.getTime();
      let last = _matter.transitionedLast.getTime();

      // If first and last are the same, then there is only transition record.
      // Note that this SHOULD always be the case for a "To Do" status.
      // Additionally, If we're in the "In Progress" group, then the last time needs to now so that
      // the correct passed time is displayed.
      if (first === last
        || _currentStatusGroupName == MATTER_STATUS_GROUP_NAME.IN_PROGRESS
      ) {
        last = Date.now();
      }

      const isInProgress = _currentStatusGroupName == MATTER_STATUS_GROUP_NAME.IN_PROGRESS;
      const resolutionTimeMs = last - first;

      cycleTime = {
        resolutionTimeMs,
        resolutionTimeFormatted: this._formatDuration(resolutionTimeMs,isInProgress),
        isInProgress: isInProgress,
        startedAt: new Date(first),
        completedAt: (_currentStatusGroupName == MATTER_STATUS_GROUP_NAME.DONE)?new Date(last):null
      }

      sla = this._formatSLAResponse(_currentStatusGroupName, resolutionTimeMs)

    return {
      cycleTime,
      sla
    };
  }

  // Helper method for formatting durations (candidates will implement this)
  protected _formatDuration(_durationMs: number, _isInProgress: boolean): string {
    // Create a partial locale for the date-fns lib to modify "days" to "d" etc.
    const shortFormat = {
      formatDistance: (token: string, count: number): string => {
        const units: Record<string, string> = {
          xYears: 'y',
          xDays: 'd',
          xHours: 'h',
          xMinutes: 'm',
          xSeconds: 's',
        };
        return `${count}${units[token] || ''}`;
      },
    };

    // Output the duration with the custom locale.
    const duration = intervalToDuration({ start: 0, end: _durationMs });
    const formatted = formatDuration(duration, {
      format: ['years', 'days', 'hours', 'minutes'],
      locale: shortFormat
    });
    return _isInProgress && _durationMs >= 60000 ?`In Progress: ${formatted}`:formatted;
  }

  /*
  * SLA Status Logic:
  * - "In Progress": Matter not yet in "Done" status
  * - "Met": Resolved within threshold (≤ 8 hours)
  * - "Breached": Resolved after threshold (> 8 hours)
  */
  protected _formatSLAResponse(_currentStatusGroupName: MatterStatusGroupName | null, _resolutionTimeMs: number):SLAStatus {
    switch (_currentStatusGroupName) {
      case MATTER_STATUS_GROUP_NAME.TODO: return SLA_STATUS_NAMES.IN_PROGRESS;
      case MATTER_STATUS_GROUP_NAME.IN_PROGRESS: return SLA_STATUS_NAMES.IN_PROGRESS;
      //For this case, we need the _resolutionTimeMs to check for breached.
      case MATTER_STATUS_GROUP_NAME.DONE: {
        if (_resolutionTimeMs <= this._slaThresholdMs) {
          return SLA_STATUS_NAMES.MET;
        }
        return SLA_STATUS_NAMES.BREACHED;
      }
      default: return SLA_STATUS_NAMES.IN_PROGRESS;
    }
  }
}

export default CycleTimeService;

