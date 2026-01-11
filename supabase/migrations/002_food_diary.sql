-- Food Entries Table
CREATE TABLE IF NOT EXISTS food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE NOT NULL,
    
    -- User Input
    user_hints TEXT,
    meal_type TEXT,
    
    -- AI Analysis Results
    food_name TEXT,
    calories NUMERIC,
    protein NUMERIC,
    fats NUMERIC,
    carbs NUMERIC,
    portion TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_entries_user_date 
    ON food_entries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_food_entries_created_at 
    ON food_entries(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own entries
CREATE POLICY "Users view own food entries" 
    ON food_entries
    FOR SELECT 
    USING (user_id = current_setting('app.user_id', true));

-- Users can insert their own entries
CREATE POLICY "Users insert own food entries" 
    ON food_entries
    FOR INSERT 
    WITH CHECK (user_id = current_setting('app.user_id', true));

-- Users can update their own entries
CREATE POLICY "Users update own food entries" 
    ON food_entries
    FOR UPDATE 
    USING (user_id = current_setting('app.user_id', true));

-- Users can delete their own entries
CREATE POLICY "Users delete own food entries" 
    ON food_entries
    FOR DELETE 
    USING (user_id = current_setting('app.user_id', true));

-- Grant permissions
GRANT ALL ON food_entries TO anon;
GRANT ALL ON food_entries TO authenticated;
