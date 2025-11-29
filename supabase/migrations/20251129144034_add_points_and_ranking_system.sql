/*
  # Add Points and Ranking System

  1. Updates to Tables
    - Add trigger to automatically update user points when submission is accepted
    - Add trigger to update user stats when they solve problems
    - Add function to calculate and update leaderboard rankings

  2. New Functions
    - `update_user_stats_on_submission`: Updates user stats when submission is accepted
    - `update_leaderboard_rankings`: Recalculates rankings based on points

  3. Security
    - Functions use SECURITY DEFINER to bypass RLS when updating stats
    - Proper search_path set for security
*/

-- Function to update user stats when a submission is accepted
CREATE OR REPLACE FUNCTION public.update_user_stats_on_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  problem_points INTEGER;
  already_solved BOOLEAN;
BEGIN
  -- Only process accepted submissions
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    -- Get problem points
    SELECT points INTO problem_points
    FROM public.problems
    WHERE id = NEW.problem_id;

    -- Check if user already solved this problem
    SELECT EXISTS(
      SELECT 1 FROM public.submissions
      WHERE user_id = NEW.user_id
        AND problem_id = NEW.problem_id
        AND status = 'accepted'
        AND id != NEW.id
    ) INTO already_solved;

    -- If first time solving this problem, update user stats
    IF NOT already_solved THEN
      UPDATE public.profiles
      SET 
        rating = rating + problem_points,
        problems_solved = problems_solved + 1,
        updated_at = now()
      WHERE id = NEW.user_id;

      -- Update problem stats
      UPDATE public.problems
      SET solved_count = solved_count + 1
      WHERE id = NEW.problem_id;
    END IF;

    -- Always update total submissions
    UPDATE public.problems
    SET 
      total_submissions = total_submissions + 1,
      acceptance_rate = ROUND((solved_count::numeric / NULLIF(total_submissions, 0)) * 100, 2)
    WHERE id = NEW.problem_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for updating user stats on submission
DROP TRIGGER IF EXISTS trigger_update_user_stats ON submissions;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_on_submission();

-- Function to update contest participation count
CREATE OR REPLACE FUNCTION public.update_contest_participation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user's contest participation count
  UPDATE public.profiles
  SET 
    contests_participated = contests_participated + 1,
    updated_at = now()
  WHERE id = NEW.user_id;

  -- Update contest participants count
  UPDATE public.contests
  SET participants_count = participants_count + 1
  WHERE id = NEW.contest_id;

  RETURN NEW;
END;
$$;

-- Trigger for updating contest participation
DROP TRIGGER IF EXISTS trigger_update_contest_participation ON contest_participants;
CREATE TRIGGER trigger_update_contest_participation
  AFTER INSERT ON public.contest_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contest_participation();

-- Create a view for leaderboard with rankings
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  country,
  rating,
  problems_solved,
  contests_participated,
  ROW_NUMBER() OVER (ORDER BY rating DESC, problems_solved DESC) as rank
FROM public.profiles
ORDER BY rating DESC, problems_solved DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_view TO authenticated;