const dev_mode = import.meta.env.VITE_DEV_MODE
const prod_domain = ""
const dev_domain = "localhost:4001"
const prod_protocol = "https"
const dev_protocol = "http"
const api_version = "v1"
const base_url = `${dev_mode ? dev_protocol : prod_protocol}://${dev_mode ? dev_domain : prod_domain}`
// const api_url = `${base_url}/${api_version}`
const graphql_base_url = `${base_url}/${api_version}/graphql`

export const api_configs = { graphql_base_url }