-- ==========================================
-- FINAL MIGRATION FOR FOOD DIARY (JSON STORAGE)
-- ==========================================

-- 1. CLEANUP (Drop old tables/functions if exist)
DROP TABLE IF EXISTS food_entries CASCADE; -- Remove old row-based table
DROP TABLE IF EXISTS food_diary CASCADE;   -- Remove if exists to recreate clean
DROP FUNCTION IF EXISTS append_to_food_diary;

-- 2. CREATE TABLE
CREATE TABLE food_diary (
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    day_json JSONB DEFAULT '[]'::jsonb, -- Array of food items
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, date)
);

-- 3. ENABLE SECURITY (RLS)
ALTER TABLE food_diary ENABLE ROW LEVEL SECURITY;

-- Allow everything for anon (for MVP simplicity)
-- In production, replace with: USING (auth.uid() = user_id)
CREATE POLICY "Allow all operations for anon" 
    ON food_diary
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant access
GRANT ALL ON food_diary TO anon;
GRANT ALL ON food_diary TO authenticated;
GRANT ALL ON food_diary TO service_role;

-- 4. CREATE HELPER FUNCTION (RPC)
-- This function atomically appends new entries to the day_json array.
-- Prevents race conditions and handles "create if not exists".

CREATE OR REPLACE FUNCTION append_to_food_diary(
    p_user_id TEXT,
    p_date DATE,
    p_new_entries JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    current_entries JSONB;
    updated_entries JSONB;
BEGIN
    -- Try to find existing row
    SELECT day_json INTO current_entries
    FROM food_diary
    WHERE user_id = p_user_id AND date = p_date;

    IF NOT FOUND THEN
        -- Case 1: No row exists for this day -> Insert new row
        INSERT INTO food_diary (user_id, date, day_json)
        VALUES (p_user_id, p_date, p_new_entries)
        RETURNING day_json INTO updated_entries;
    ELSE
        -- Case 2: Row exists -> Append new entries to existing array
        -- We use the || operator which concatenates JSON arrays
        UPDATE food_diary
        SET 
            day_json = day_json || p_new_entries,
            updated_at = NOW()
        WHERE user_id = p_user_id AND date = p_date
        RETURNING day_json INTO updated_entries;
    END IF;

    RETURN updated_entries;
END;
$$;

-- Grant execution rights
GRANT EXECUTE ON FUNCTION append_to_food_diary TO anon;
GRANT EXECUTE ON FUNCTION append_to_food_diary TO authenticated;
GRANT EXECUTE ON FUNCTION append_to_food_diary TO service_role;

-- 5. INFO
COMMENT ON TABLE food_diary IS 'Stores daily food logs as a JSON array per user/date';
COMMENT ON COLUMN food_diary.day_json IS 'Array of objects: [{name, calories, protein...}, ...]';
