import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { api_configs } from './api.configs';

const client = new ApolloClient({
    link: new HttpLink({
        uri: api_configs.graphql_base_url
    }),
    cache: new InMemoryCache(),
});

export default client;