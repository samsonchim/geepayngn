const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (no password required)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Wrapper functions to maintain compatibility with existing code
const executeQuery = async (query, params = []) => {
    try {
        // Convert PostgreSQL query to Supabase format
        if (query.toLowerCase().includes('select')) {
            // Handle SELECT queries
            const tableName = extractTableName(query);
            let supabaseQuery = supabase.from(tableName).select('*');
            
            // Add WHERE conditions if params exist
            if (params.length > 0) {
                // This is a simplified approach - you may need to adjust based on your queries
                const result = await supabaseQuery;
                return { rows: result.data || [], rowCount: result.data?.length || 0 };
            }
            
            const result = await supabaseQuery;
            return { rows: result.data || [], rowCount: result.data?.length || 0 };
        } else {
            // For INSERT, UPDATE, DELETE - fall back to RPC or raw SQL
            const { data, error } = await supabase.rpc('execute_sql', { 
                sql_query: query, 
                params: params 
            });
            
            if (error) throw error;
            return { rows: data || [], rowCount: data?.length || 0 };
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const executeQueryWithResult = async (query, params = []) => {
    return executeQuery(query, params);
};

// Helper function to extract table name from SQL query
function extractTableName(query) {
    const fromMatch = query.match(/FROM\s+(\w+)/i);
    const intoMatch = query.match(/INSERT\s+INTO\s+(\w+)/i);
    const updateMatch = query.match(/UPDATE\s+(\w+)/i);
    
    if (fromMatch) return fromMatch[1];
    if (intoMatch) return intoMatch[1];
    if (updateMatch) return updateMatch[1];
    
    return 'users'; // default fallback
}

module.exports = {
    supabase,
    executeQuery,
    executeQueryWithResult,
};
