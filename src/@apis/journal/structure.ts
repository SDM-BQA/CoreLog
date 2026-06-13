export const CREATE_JOURNAL_MUTATION = `
    mutation CreateJournal($input: CreateJournalInput!) {
        create_journal(input: $input) {
            _id
            title
            content
            description
            date
            time
            journal_type
            mood
            location
            location_address
            location_city
            location_lat
            location_lng
            photos
            tags
            template_blocks {
                id
                type
                title
                items {
                    id
                    amount
                    note
                    category
                }
            }
            is_favorite
            created_at
        }
    }
`;

export const GET_MY_JOURNALS_QUERY = `
    query GetMyJournals($filter: JournalFilter) {
        get_my_journals(filter: $filter) {
            journals {
                _id
                title
                content
                description
                journal_type
                mood
                location
                location_address
                location_city
                location_lat
                location_lng
                photos
                tags
                template_blocks {
                    id
                    type
                    title
                    items {
                        id
                        amount
                        note
                        category
                    }
                }
                date
                time
                is_favorite
                created_at
                updated_at
            }
            total_count
            current_page
            per_page
            page_count
            has_next_page
        }
    }
`;

export const GET_JOURNAL_STREAK_QUERY = `
    query GetJournalStreak {
        get_journal_streak {
            current_streak
            longest_streak
            total_active_days
            active_days_this_month
            last_entry_date
            streak_updated_at
        }
    }
`;

export const GET_JOURNAL_FILTERS_QUERY = `
    query GetJournalFilters {
        get_journal_filters {
            tags
        }
    }
`;

export const GET_JOURNAL_QUERY = `
    query GetJournal($id: ID!) {
        get_journal(id: $id) {
            _id
            title
            content
            description
            journal_type
            mood
            location
            location_address
            location_city
            location_lat
            location_lng
            photos
            video
            tags
            template_blocks {
                id
                type
                title
                items {
                    id
                    amount
                    note
                    category
                }
            }
            date
            time
            is_favorite
            user_id
            created_at
            updated_at
        }
    }
`;

export const UPDATE_JOURNAL_MUTATION = `
    mutation UpdateJournal($id: ID!, $input: UpdateJournalInput!) {
        update_journal(id: $id, input: $input) {
            _id
            title
            content
            description
            journal_type
            mood
            location
            location_address
            location_city
            location_lat
            location_lng
            photos
            tags
            template_blocks {
                id
                type
                title
                items {
                    id
                    amount
                    note
                    category
                }
            }
            date
            time
            is_favorite
            updated_at
        }
    }
`;

export const DELETE_JOURNAL_MUTATION = `
    mutation DeleteJournal($id: ID!) {
        delete_journal(id: $id)
    }
`;

export const GET_JOURNAL_TEMPLATES_QUERY = `
    query GetJournalTemplates {
        get_journal_templates {
            _id
            name
            content
            category
            user_id
            created_at
            updated_at
        }
    }
`;

export const CREATE_JOURNAL_TEMPLATE_MUTATION = `
    mutation CreateJournalTemplate($input: SavedJournalTemplateInput!) {
        create_journal_template(input: $input) {
            _id
            name
            content
            category
            user_id
            created_at
            updated_at
        }
    }
`;

export const UPDATE_JOURNAL_TEMPLATE_MUTATION = `
    mutation UpdateJournalTemplate($id: ID!, $input: SavedJournalTemplateInput!) {
        update_journal_template(id: $id, input: $input) {
            _id
            name
            content
            category
            user_id
            created_at
            updated_at
        }
    }
`;

export const DELETE_JOURNAL_TEMPLATE_MUTATION = `
    mutation DeleteJournalTemplate($id: ID!) {
        delete_journal_template(id: $id)
    }
`;
