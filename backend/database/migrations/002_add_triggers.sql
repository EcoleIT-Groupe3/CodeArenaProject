-- Function to update user stats when a submission is accepted
CREATE OR REPLACE FUNCTION update_user_stats_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  problem_points INTEGER;
  already_solved BOOLEAN;
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    SELECT points INTO problem_points
    FROM problems
    WHERE id = NEW.problem_id;

    SELECT EXISTS(
      SELECT 1 FROM submissions
      WHERE user_id = NEW.user_id
        AND problem_id = NEW.problem_id
        AND status = 'accepted'
        AND id != NEW.id
    ) INTO already_solved;

    IF NOT already_solved THEN
      UPDATE users
      SET
        rating = rating + problem_points,
        problems_solved = problems_solved + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.user_id;

      UPDATE problems
      SET solved_count = solved_count + 1
      WHERE id = NEW.problem_id;
    END IF;

    UPDATE problems
    SET
      total_submissions = total_submissions + 1,
      acceptance_rate = ROUND((solved_count::numeric / NULLIF(total_submissions, 0)) * 100, 2)
    WHERE id = NEW.problem_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating user stats on submission
DROP TRIGGER IF EXISTS trigger_update_user_stats ON submissions;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_submission();

-- Function to update contest participation count
CREATE OR REPLACE FUNCTION update_contest_participation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    contests_participated = contests_participated + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.user_id;

  UPDATE contests
  SET participants_count = participants_count + 1
  WHERE id = NEW.contest_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating contest participation
DROP TRIGGER IF EXISTS trigger_update_contest_participation ON contest_participants;
CREATE TRIGGER trigger_update_contest_participation
  AFTER INSERT ON contest_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_participation();
