export const WORKSPACE_KEYS = [
  'upsc_offline_articles', 'upsc_reading_positions',
  'app_current_view','app_eye_saver_tint','app_focused_reading','app_glass_mode',
  'app_model','app_reader_contrast','app_reader_font','app_reader_font_size',
  'app_reader_line_height','app_recent_views','app_sidebar_width','app_theme',
  'library_profile_avatar','library_profile_name','rss_reader_font','rss_reader_font_size',
  'upsc_affairs_v2','upsc_chat_history','upsc_chat_sessions','upsc_current_focus_subject',
  'upsc_current_focus_topic','upsc_daily_goal_hours','upsc_daily_planner','upsc_daily_tracker_tasks',
  'upsc_data_bank','upsc_deep_work_logs','upsc_deep_work_stats','upsc_exam_dates',
  'upsc_micro_planner','upsc_mistake_book','upsc_pyq_sidebar_tab','upsc_quick_notes',
  'upsc_read_rss_items','upsc_rss_ai_brief_summaries','upsc_rss_ai_summaries',
  'upsc_rss_digest_source_items','upsc_rss_feeds','upsc_rss_flashcards','upsc_rss_mcqs',
  'upsc_saved_blueprints','upsc_saved_evals','upsc_saved_notes','upsc_saved_pyqs',
  'upsc_saved_rss_notes','upsc_sessions_count','upsc_spaced_recall_v1',
  'upsc_syllabus_v2','upsc_test_history'
];
export type Workspace = Record<string, string>;
export function validateWorkspace(value: unknown): Workspace {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid workspace.');
  const data: Workspace = {};
  for (const [key, item] of Object.entries(value)) {
    if (!WORKSPACE_KEYS.includes(key)) continue;
    if (item === null) continue;
    if (typeof item !== 'string') throw new Error('Invalid workspace value: ' + key);
    data[key] = item;
  }
  return data;
}
