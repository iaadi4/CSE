use confik::Configuration;

#[derive(Debug, Default, Configuration)]
pub struct RouterConfig {
    pub server_addr: String,
}
