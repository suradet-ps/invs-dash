use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tiberius::{Client, Config, AuthMethod, EncryptionLevel};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_util::compat::{TokioAsyncWriteCompatExt, Compat};

// ─── Connection Config ───────────────────────────────────────────────────────

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct InvsDbConfig {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
    pub database: String,
    pub instance: Option<String>,
}

// ─── Managed State ───────────────────────────────────────────────────────────

pub struct DbState(pub Arc<Mutex<Option<Client<Compat<TcpStream>>>>>);

// ─── Connect ─────────────────────────────────────────────────────────────────

pub async fn connect(cfg: &InvsDbConfig) -> Result<Client<Compat<TcpStream>>, String> {
    let mut config = Config::new();

    config.host(&cfg.host);
    config.port(cfg.port);
    config.authentication(AuthMethod::sql_server(&cfg.user, &cfg.password));
    config.database(&cfg.database);
    config.encryption(EncryptionLevel::NotSupported);
    config.trust_cert();

    if let Some(ref inst) = cfg.instance {
        if !inst.is_empty() {
            config.instance_name(inst);
        }
    }

    let tcp = TcpStream::connect(config.get_addr())
        .await
        .map_err(|e| format!("TCP connect failed: {e}"))?;

    tcp.set_nodelay(true)
        .map_err(|e| format!("set_nodelay failed: {e}"))?;

    let client = Client::connect(config, tcp.compat_write())
        .await
        .map_err(|e| format!("SQL Server connect failed: {e}"))?;

    Ok(client)
}
