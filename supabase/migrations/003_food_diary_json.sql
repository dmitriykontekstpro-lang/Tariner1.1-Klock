-- Create new table for JSON-based storage
CREATE TABLE IF NOT EXISTS food_diary (
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    day_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, date)
);

-- Enable RLS
ALTER TABLE food_diary ENABLE ROW LEVEL SECURITY;

-- Allow everything for anon (for MVP simplicity, can be tightened later)
CREATE POLICY "Allow all for anon users" 
    ON food_diary
    FOR ALL
    USING (true)
    WITH CHECK (true);

GRANT ALL ON food_diary TO anon;
GRANT ALL ON food_diary TO authenticated;

-- Function to append entries to the JSON array
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
    -- Get current entries
    SELECT day_json INTO current_entries
    FROM food_diary
    WHERE user_id = p_user_id AND date = p_date;

    IF NOT FOUND THEN
        -- Insert new row if not exists
        INSERT INTO food_diary (user_id, date, day_json)
        VALUES (p_user_id, p_date, p_new_entries)
        RETURNING day_json INTO updated_entries;
    ELSE
        -- Update existing row by appending new entries
        -- We assume both are arrays. coalesce ensures we don't fail on nulls.
        UPDATE food_diary
        SET 
            day_json = COALESCE(day_json, '[]'::jsonb) || p_new_entries,
            updated_at = NOW()
        WHERE user_id = p_user_id AND date = p_date
        RETURNING day_json INTO updated_entries;
    END IF;

    RETURN updated_entries;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION append_to_food_diary TO anon;
GRANT EXECUTE ON FUNCTION append_to_food_diary TO authenticated;
