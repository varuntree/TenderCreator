-- Add bid_analysis JSONB column to work_package_content table
-- This stores the AI-generated bid/no-bid analysis including criteria scores, recommendation, strengths, and concerns

ALTER TABLE work_package_content
ADD COLUMN bid_analysis JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN work_package_content.bid_analysis IS 'AI-generated bid/no-bid analysis with criteria, scores, recommendation, strengths, and concerns';
