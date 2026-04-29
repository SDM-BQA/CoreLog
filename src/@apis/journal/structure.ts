export const CREATE_JOURNAL_MUTATION = `
    mutation CreateJournal($input: CreateJournalInput!) {
        create_journal(input: $input) {
            _id
            title
            date
            journal_type
            mood
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
                photos
                tags
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
            photos
            video
            tags
            date
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
            photos
            tags
            date
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
