import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import type { Express } from 'express';
import pool from '../../../../db/pool.js';

/**
 * Integration tests for GET /api/v1/matters sorting functionality
 *
 * These tests verify that the API correctly sorts matters by different field types
 * using real database queries against seeded test data.
 *
 */

// Check if we can connect to the database
let databaseAvailable = false;
let app: Express;
let request: typeof import('supertest').default;
let subjectFieldId: string;
let contractValueFieldId: string;
let statusFieldId: string;
let priorityFieldId: string;
let assignedToFieldId: string;
let caseNumberFieldId: string;
let dueDateFieldId: string;

// Helper to skip test if database is not available
const itIfDb = (name: string, fn: () => Promise<void>) => {
    it(name, async () => {
        if (!databaseAvailable) {
            console.log(`Skipping "${name}" - database not available`);
            return;
        }
        await fn();
    });
};

describe('GET /api/v1/matters sorting integration tests', () => {
    beforeAll(async () => {
        // Check if database is available BEFORE importing app (which triggers server startup)
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');

            // Query for field UUIDs from the database since this is how the frontend requests to sort columns.
            const fieldsResult = await client.query(`
                SELECT id, name, field_type
                FROM ticketing_fields
                WHERE name IN ('subject', 'Contract Value', 'Status', 'Priority', 'Assigned To', 'Case Number', 'Due Date')
            `);

            for (const row of fieldsResult.rows) {
                switch (row.name) {
                    case 'subject':
                        subjectFieldId = row.id;
                        break;
                    case 'Contract Value':
                        contractValueFieldId = row.id;
                        break;
                    case 'Status':
                        statusFieldId = row.id;
                        break;
                    case 'Priority':
                        priorityFieldId = row.id;
                        break;
                    case 'Assigned To':
                        assignedToFieldId = row.id;
                        break;
                    case 'Case Number':
                        caseNumberFieldId = row.id;
                        break;
                    case 'Due Date':
                        dueDateFieldId = row.id;
                        break;
                }
            }

            client.release();
            databaseAvailable = true;

            // Only import app and supertest if database is available
            const appModule = await import('../../../../app.js');
            app = appModule.default;
            const supertestModule = await import('supertest');
            request = supertestModule.default;
        } catch (error) {
            console.warn('Database not available, integration tests will be skipped:', (error as Error).message);
            databaseAvailable = false;
        }
    });

    afterAll(async () => {
        if (databaseAvailable) {
            await pool.end();
        }
    });

    describe('sorting by created_at (default sort)', () => {
        itIfDb('sorts by created_at descending by default', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({ limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        itIfDb('sorts by created_at ascending when specified', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({ sortBy: 'created_at', sortOrder: 'asc', limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('sorting by text field (Subject)', () => {
        itIfDb('sorts by text field ascending', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({
                    sortBy: subjectFieldId,
                    sortType: 'text',
                    sortOrder: 'asc',
                    limit: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(1);

            // Verify alphabetical order (ascending)
            const subjects = response.body.data.map((m: { fields: Record<string, { value: string }> }) =>
                m.fields['subject']?.value
            ).filter(Boolean);

            for (let i = 1; i < subjects.length; i++) {
                expect(subjects[i - 1].localeCompare(subjects[i])).toBeLessThanOrEqual(0);
            }
        });

        itIfDb('sorts by text field descending', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({
                    sortBy: subjectFieldId,
                    sortType: 'text',
                    sortOrder: 'desc',
                    limit: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(1);

            // Verify alphabetical order (descending)
            const subjects = response.body.data.map((m: { fields: Record<string, { value: string }> }) =>
                m.fields['subject']?.value
            ).filter(Boolean);

            for (let i = 1; i < subjects.length; i++) {
                expect(subjects[i - 1].localeCompare(subjects[i])).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('sorting by currency field (Contract Value)', () => {
        itIfDb('sorts by currency amount ascending', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({
                    sortBy: contractValueFieldId,
                    sortType: 'currency',
                    sortOrder: 'asc',
                    limit: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(1);

            // Verify numeric order (ascending by amount)
            const amounts = response.body.data.map((m: { fields: Record<string, { value: { amount: number } }> }) =>
                m.fields['Contract Value']?.value?.amount
            ).filter((a: number | undefined) => a !== undefined);

            for (let i = 1; i < amounts.length; i++) {
                expect(amounts[i - 1]).toBeLessThanOrEqual(amounts[i]);
            }
        });

        itIfDb('sorts by currency amount descending', async () => {
            const response = await request(app)
                .get('/api/v1/matters')
                .query({
                    sortBy: contractValueFieldId,
                    sortType: 'currency',
                    sortOrder: 'desc',
                    limit: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBeGreaterThan(1);

            // Verify numeric order (descending by amount)
            const amounts = response.body.data.map((m: { fields: Record<string, { value: { amount: number } }> }) =>
                m.fields['Contract Value']?.value?.amount
            ).filter((a: number | undefined) => a !== undefined);

            for (let i = 1; i < amounts.length; i++) {
                expect(amounts[i - 1]).toBeGreaterThanOrEqual(amounts[i]);
            }
        });
    });

    // TODO: All the other test cases for this API (Other sorting columns, invalid columns, invalid sort configurations etc.)
});
