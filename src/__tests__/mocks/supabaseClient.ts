import { vi } from 'vitest';

interface QueryBuilder {
    data: any;
    error: any;
    _mockData: any;
    _mockError: any;
    _returnData(): { data: any; error: any };
    select(): QueryBuilder;
    insert(): Promise<{ data: any; error: any }>;
    update(): Promise<{ data: any; error: any }>;
    delete(): Promise<{ data: any; error: any }>;
    eq(): Promise<{ data: any; error: any }>;
    mockResponse(data: any, error?: any): QueryBuilder;
}

const createQueryBuilder = (): QueryBuilder => {
    const builder: QueryBuilder = {
        data: null,
        error: null,
        _mockData: null,
        _mockError: null,
        _returnData() {
            return {
                data: this._mockData || [],
                error: this._mockError || null
            };
        },
        select: function(this: QueryBuilder) {
            return this;
        },
        insert: function(this: QueryBuilder) {
            const result = this._returnData();
            return Promise.resolve(result);
        },
        update: function(this: QueryBuilder) {
            const result = this._returnData();
            return Promise.resolve(result);
        },
        delete: function(this: QueryBuilder) {
            const result = this._returnData();
            return Promise.resolve(result);
        },
        eq: function(this: QueryBuilder) {
            const result = this._returnData();
            return Promise.resolve(result);
        },
        mockResponse: function(this: QueryBuilder, data: any, error: any = null) {
            this._mockData = data;
            this._mockError = error;
            return this;
        }
    };

    return builder;
};

interface SupabaseMock {
    from: (table: string) => ReturnType<typeof createQueryBuilder>;
    auth: {
        getUser: () => Promise<{ data: { user: null }; error: null }>;
        getSession: () => Promise<{ data: { session: null }; error: null }>;
        onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } };
        signOut: () => Promise<{ error: null }>;
    };
}

export const supabase: SupabaseMock = {
    from: vi.fn((table: string) => createQueryBuilder()),
    auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signOut: vi.fn().mockResolvedValue({ error: null })
    }
}; 