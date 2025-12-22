import { describe, beforeEach, it, expect } from 'vitest';
import { MatterRepo } from '../repo/matter_repo.js';

class TestMatterRepo extends MatterRepo {
    public testGetSortColumn(sortType: string): string {
        return this._getSortColumn(sortType);
    }

    public testGetSortJoin(sortType: string): string {
        return this._getSortJoin(sortType);
    }

    public testGetSortSelect(sortType: string): string {
        return this._getSortSelect(sortType);
    }

    public testBuildSearchCondition(paramIndex: number): string {
        return this._buildSearchCondition(paramIndex);
    }
}

// These are all very basic tests.

describe('MatterRepo', () => {
    let repo: TestMatterRepo;

    beforeEach(() => {
        repo = new TestMatterRepo();
    });

    describe('_getSortColumn', () => {
        it('returns tt.created_at for created_at sort type', () => {
            const result = repo.testGetSortColumn('created_at');
            expect(result).toBe('tt.created_at');
        });

        it('returns sort_value for text sort type', () => {
            const result = repo.testGetSortColumn('text');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for number sort type', () => {
            const result = repo.testGetSortColumn('number');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for date sort type', () => {
            const result = repo.testGetSortColumn('date');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for boolean sort type', () => {
            const result = repo.testGetSortColumn('boolean');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for currency sort type', () => {
            const result = repo.testGetSortColumn('currency');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for status sort type', () => {
            const result = repo.testGetSortColumn('status');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for select sort type', () => {
            const result = repo.testGetSortColumn('select');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for user sort type', () => {
            const result = repo.testGetSortColumn('user');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for resolution_time sort type', () => {
            const result = repo.testGetSortColumn('resolution_time');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for sla sort type', () => {
            const result = repo.testGetSortColumn('sla');
            expect(result).toBe('sort_value');
        });

        it('returns sort_value for unknown sort type (default)', () => {
            const result = repo.testGetSortColumn('unknown_type');
            expect(result).toBe('sort_value');
        });
    });

    describe('_getSortJoin', () => {
        it('returns status options JOIN for status sort type', () => {
            const result = repo.testGetSortJoin('status');
            expect(result).toBe('LEFT JOIN ticketing_field_status_options AS tfso ON ttfv.status_reference_value_uuid = tfso.id');
        });

        it('returns field options JOIN for select sort type', () => {
            const result = repo.testGetSortJoin('select');
            expect(result).toBe('LEFT JOIN ticketing_field_options AS tfo ON ttfv.select_reference_value_uuid = tfo.id');
        });

        it('returns users JOIN for user sort type', () => {
            const result = repo.testGetSortJoin('user');
            expect(result).toBe('LEFT JOIN users AS u ON ttfv.user_value = u.id');
        });

        it('returns empty string for text sort type', () => {
            const result = repo.testGetSortJoin('text');
            expect(result).toBe('');
        });

        it('returns empty string for number sort type', () => {
            const result = repo.testGetSortJoin('number');
            expect(result).toBe('');
        });

        it('returns empty string for date sort type', () => {
            const result = repo.testGetSortJoin('date');
            expect(result).toBe('');
        });

        it('returns empty string for boolean sort type', () => {
            const result = repo.testGetSortJoin('boolean');
            expect(result).toBe('');
        });

        it('returns empty string for currency sort type', () => {
            const result = repo.testGetSortJoin('currency');
            expect(result).toBe('');
        });

        it('returns empty string for created_at sort type', () => {
            const result = repo.testGetSortJoin('created_at');
            expect(result).toBe('');
        });

        it('returns empty string for resolution_time sort type', () => {
            const result = repo.testGetSortJoin('resolution_time');
            expect(result).toBe('');
        });

        it('returns empty string for sla sort type', () => {
            const result = repo.testGetSortJoin('sla');
            expect(result).toBe('');
        });

        it('returns empty string for unknown sort type (default)', () => {
            const result = repo.testGetSortJoin('unknown_type');
            expect(result).toBe('');
        });
    });

    describe('_getSortSelect', () => {
        it('returns created_at expression for created_at sort type', () => {
            const result = repo.testGetSortSelect('created_at');
            expect(result).toBe('tt.created_at AS sort_value');
        });

        it('returns COALESCE expression for text sort type', () => {
            const result = repo.testGetSortSelect('text');
            expect(result).toBe('COALESCE(ttfv.text_value, ttfv.string_value) AS sort_value');
        });

        it('returns number_value expression for number sort type', () => {
            const result = repo.testGetSortSelect('number');
            expect(result).toBe('ttfv.number_value AS sort_value');
        });

        it('returns date_value expression for date sort type', () => {
            const result = repo.testGetSortSelect('date');
            expect(result).toBe('ttfv.date_value AS sort_value');
        });

        it('returns boolean_value expression for boolean sort type', () => {
            const result = repo.testGetSortSelect('boolean');
            expect(result).toBe('ttfv.boolean_value AS sort_value');
        });

        it('returns JSONB extraction with cast for currency sort type', () => {
            const result = repo.testGetSortSelect('currency');
            expect(result).toBe("(ttfv.currency_value->>'amount')::numeric AS sort_value");
        });

        it('returns sequence expression for status sort type', () => {
            const result = repo.testGetSortSelect('status');
            expect(result).toBe('tfso.sequence AS sort_value');
        });

        it('returns sequence expression for select sort type', () => {
            const result = repo.testGetSortSelect('select');
            expect(result).toBe('tfo.sequence AS sort_value');
        });

        it('returns last_name expression for user sort type', () => {
            const result = repo.testGetSortSelect('user');
            expect(result).toBe('u.last_name AS sort_value');
        });

        it('returns complex CASE statement for resolution_time sort type', () => {
            const result = repo.testGetSortSelect('resolution_time');
            // Verify it contains the key parts of the CASE statement
            expect(result).toContain('CASE');
            expect(result).toContain('AS sort_value');
            expect(result).toContain('ticketing_cycle_time_histories');
            expect(result).toContain('ticketing_field_status_options');
            expect(result).toContain('ticketing_field_status_groups');
        });

        it('returns placeholder for sla sort type', () => {
            const result = repo.testGetSortSelect('sla');
            expect(result).toBe('1 AS sort_value');
        });

        it('returns empty string for unknown sort type (default)', () => {
            const result = repo.testGetSortSelect('unknown_type');
            expect(result).toBe('');
        });
    });

    describe('_buildSearchCondition', () => {
        it('returns placeholder $1 for search query', () => {
            const queryPart = repo.testBuildSearchCondition(1);
            expect(queryPart).toContain('$1');
        });
        it('returns placeholder $5 for search query', () => {
            const queryPart = repo.testBuildSearchCondition(5);
            expect(queryPart).toContain('$5');
        });
    });

    
});
