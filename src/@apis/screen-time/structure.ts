export const PARSE_SCREEN_TIME_IMAGE_MUTATION = `
  mutation ParseScreenTimeImage($image_base64: String!) {
    parse_screen_time_image(image_base64: $image_base64) {
      raw_text
      total_minutes
      categories {
        name
        minutes
      }
      apps {
        app_name
        minutes
      }
    }
  }
`;

export const SAVE_SCREEN_TIME_ENTRY_MUTATION = `
  mutation SaveScreenTimeEntry($entry_date: String!, $categories: [ScreenTimeCategoryUsageInput!], $apps: [ScreenTimeAppUsageInput!]!, $raw_text: String, $total_minutes: Int) {
    save_screen_time_entry(entry_date: $entry_date, categories: $categories, apps: $apps, raw_text: $raw_text, total_minutes: $total_minutes) {
      _id
      entry_date
      total_minutes
      raw_text
      categories {
        name
        minutes
      }
      apps {
        app_name
        minutes
      }
      created_at
      updated_at
    }
  }
`;

export const DELETE_SCREEN_TIME_ENTRY_MUTATION = `
  mutation DeleteScreenTimeEntry($entry_date: String!) {
    delete_screen_time_entry(entry_date: $entry_date)
  }
`;

export const GET_SCREEN_TIME_ENTRIES_QUERY = `
  query GetScreenTimeEntries($date_from: String, $date_to: String) {
    get_screen_time_entries(date_from: $date_from, date_to: $date_to) {
      _id
      entry_date
      total_minutes
      raw_text
      categories {
        name
        minutes
      }
      apps {
        app_name
        minutes
      }
      created_at
      updated_at
    }
  }
`;

export const GET_SCREEN_TIME_SUMMARY_QUERY = `
  query GetScreenTimeSummary($date_from: String, $date_to: String) {
    get_screen_time_summary(date_from: $date_from, date_to: $date_to) {
      total_days
      total_minutes
      avg_daily_minutes
      most_used_app
      most_used_app_minutes
      daily {
        _id
        entry_date
        total_minutes
        categories {
          name
          minutes
        }
        apps {
          app_name
          minutes
        }
      }
    }
  }
`;
