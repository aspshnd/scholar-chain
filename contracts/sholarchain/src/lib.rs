#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    symbol_short, Address, Env, String, Symbol, token, log,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ScholarError {
    NotAuthorized       = 1,
    AlreadyRegistered   = 2,
    RecipientNotFound   = 3,
    GrantNotFound       = 4,
    InsufficientFunds   = 5,
    RequirementsNotMet  = 6,
    AlreadyDisbursed    = 7,
    InvalidAmount       = 8,
    GrantExpired        = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RecipientStatus {
    Pending,
    Verified,
    Rejected,
    Disbursed,
    Suspended,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Recipient {
    pub wallet:        Address,
    pub student_id:    String,
    pub name:          String,
    pub status:        RecipientStatus,
    pub registered_at: u64,
    pub verified_at:   u64,
    pub disbursed_at:  u64,
    pub grant_id:      u64,
    pub ipk:           u32,
    pub krs_hash:      String,
    pub verifier:      Address,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Grant {
    pub id:                   u64,
    pub name:                 String,
    pub sponsor:              Address,
    pub total_fund:           i128,
    pub disbursed_amount:     i128,
    pub amount_per_recipient: i128,
    pub max_recipients:       u32,
    pub current_recipients:   u32,
    pub min_ipk:              u32,
    pub deadline:             u64,
    pub is_active:            bool,
    pub token_address:        Address,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct DashboardStats {
    pub total_grants:     u64,
    pub total_recipients: u64,
    pub total_disbursed:  i128,
    pub total_pending:    u64,
    pub total_verified:   u64,
    pub last_updated:     u64,
}

const ADMIN_KEY:     Symbol = symbol_short!("ADMIN");
const GRANT_CNT_KEY: Symbol = symbol_short!("GRANTCNT");
const RECIP_CNT_KEY: Symbol = symbol_short!("RECIPCNT");
const STATS_KEY:     Symbol = symbol_short!("STATS");

fn grant_key(id: u64) -> (Symbol, u64) { (symbol_short!("GRANT"), id) }
fn recipient_key(sid: &String) -> (Symbol, String) { (symbol_short!("RECIP"), sid.clone()) }
fn verifier_key(addr: &Address) -> (Symbol, Address) { (symbol_short!("VERIF"), addr.clone()) }

#[contract]
pub struct ScholarChain;

#[contractimpl]
impl ScholarChain {

    pub fn initialize(env: Env, admin: Address) -> Result<(), ScholarError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(ScholarError::NotAuthorized);
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&GRANT_CNT_KEY, &0u64);
        env.storage().instance().set(&RECIP_CNT_KEY, &0u64);
        env.storage().instance().set(&STATS_KEY, &DashboardStats {
            total_grants: 0, total_recipients: 0, total_disbursed: 0,
            total_pending: 0, total_verified: 0,
            last_updated: env.ledger().timestamp(),
        });
        Ok(())
    }

    pub fn add_verifier(env: Env, admin: Address, verifier: Address) -> Result<(), ScholarError> {
        Self::assert_admin(&env, &admin)?;
        admin.require_auth();
        env.storage().instance().set(&verifier_key(&verifier), &true);
        Ok(())
    }

    pub fn remove_verifier(env: Env, admin: Address, verifier: Address) -> Result<(), ScholarError> {
        Self::assert_admin(&env, &admin)?;
        admin.require_auth();
        env.storage().instance().set(&verifier_key(&verifier), &false);
        Ok(())
    }

    pub fn create_grant(
        env: Env, sponsor: Address, name: String,
        amount_per_recipient: i128, max_recipients: u32,
        min_ipk: u32, deadline: u64, token_address: Address,
    ) -> Result<u64, ScholarError> {
        sponsor.require_auth();
        if amount_per_recipient <= 0 || max_recipients == 0 {
            return Err(ScholarError::InvalidAmount);
        }
        let total = amount_per_recipient * max_recipients as i128;
        token::Client::new(&env, &token_address)
            .transfer(&sponsor, &env.current_contract_address(), &total);

        let count: u64 = env.storage().instance().get(&GRANT_CNT_KEY).unwrap_or(0);
        let new_id = count + 1;
        env.storage().persistent().set(&grant_key(new_id), &Grant {
            id: new_id, name, sponsor, total_fund: total, disbursed_amount: 0,
            amount_per_recipient, max_recipients, current_recipients: 0,
            min_ipk, deadline, is_active: true, token_address,
        });
        env.storage().instance().set(&GRANT_CNT_KEY, &new_id);

        env.events().publish(
            (symbol_short!("grant"),),
            new_id
        );

        let mut s: DashboardStats =
            env.storage()
                .instance()
                .get(&STATS_KEY)
                .unwrap_or(DashboardStats {
                    total_grants: 0,
                    total_recipients: 0,
                    total_disbursed: 0,
                    total_pending: 0,
                    total_verified: 0,
                    last_updated: env.ledger().timestamp(),
                });

        s.total_grants += 1;
        s.last_updated = env.ledger().timestamp();

        env.storage().instance().set(&STATS_KEY, &s);

        Ok(new_id)
    }

    pub fn register_recipient(
        env: Env, wallet: Address, student_id: String, name: String,
        grant_id: u64, ipk: u32, krs_hash: String,
    ) -> Result<(), ScholarError> {
        wallet.require_auth();

        if env.storage().persistent().has(&recipient_key(&student_id)) {
            return Err(ScholarError::AlreadyRegistered);
        }

        let grant: Grant = env.storage().persistent()
            .get(&grant_key(grant_id))
            .ok_or(ScholarError::GrantNotFound)?;

        if !grant.is_active {
            return Err(ScholarError::GrantExpired);
        }

        if env.ledger().timestamp() > grant.deadline {
            return Err(ScholarError::GrantExpired);
        }

        if grant.current_recipients >= grant.max_recipients {
            return Err(ScholarError::InsufficientFunds);
        }

        if ipk < grant.min_ipk {
            return Err(ScholarError::RequirementsNotMet);
        }

        // ── SIMPAN DATA ON-CHAIN ──
        env.storage().persistent().set(&recipient_key(&student_id), &Recipient {
            wallet: wallet.clone(),
            student_id: student_id.clone(),
            name: name.clone(),
            status: RecipientStatus::Pending,
            registered_at: env.ledger().timestamp(),
            verified_at: 0,
            disbursed_at: 0,
            grant_id,
            ipk,
            krs_hash: krs_hash.clone(),
            verifier: wallet.clone(),
        });

        let cnt: u64 = env.storage().instance().get(&RECIP_CNT_KEY).unwrap_or(0);
        env.storage().instance().set(&RECIP_CNT_KEY, &(cnt + 1));

        let mut s: DashboardStats = env.storage().instance().get(&STATS_KEY).unwrap();
        s.total_recipients += 1;
        s.total_pending += 1;
        s.last_updated = env.ledger().timestamp();
        env.storage().instance().set(&STATS_KEY, &s);

        // ── EVENT ON-CHAIN LOG (INI YANG DITAMBAHKAN) ──
        env.events().publish(
            (symbol_short!("reg"),),
            (wallet.clone(), grant_id, student_id)
        );

        Ok(())
    }

    pub fn verify_and_disburse(
        env: Env, verifier: Address, student_id: String,
        approved: bool, rejection_reason: String,
    ) -> Result<(), ScholarError> {
        verifier.require_auth();
        let is_ver: bool = env.storage().instance()
            .get(&verifier_key(&verifier)).unwrap_or(false);
        let admin: Address =
        env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(ScholarError::NotAuthorized)?;
        if !is_ver && verifier != admin { return Err(ScholarError::NotAuthorized); }

        let mut r: Recipient = env.storage().persistent()
            .get(&recipient_key(&student_id)).ok_or(ScholarError::RecipientNotFound)?;
        if r.status != RecipientStatus::Pending { return Err(ScholarError::AlreadyDisbursed); }

        let mut s: DashboardStats = env.storage().instance().get(&STATS_KEY).unwrap();
        s.total_pending = s.total_pending.saturating_sub(1);

        if !approved {
            r.status = RecipientStatus::Rejected;
            r.verifier = verifier;
            env.storage().persistent().set(&recipient_key(&student_id), &r);
            s.last_updated = env.ledger().timestamp();
            env.storage().instance().set(&STATS_KEY, &s);
            log!(&env, "Rejected: {} - {}", student_id, rejection_reason);

            // EVENT REJECT
            env.events().publish(
                (symbol_short!("reject"),),
                &student_id
            );

            return Ok(());
        }

        let mut grant: Grant = env.storage().persistent()
            .get(&grant_key(r.grant_id)).ok_or(ScholarError::GrantNotFound)?;
        if grant.total_fund - grant.disbursed_amount < grant.amount_per_recipient {
            return Err(ScholarError::InsufficientFunds);
        }

        token::Client::new(&env, &grant.token_address)
            .transfer(&env.current_contract_address(), &r.wallet, &grant.amount_per_recipient);

        grant.disbursed_amount += grant.amount_per_recipient;
        grant.current_recipients += 1;
        env.storage().persistent().set(&grant_key(r.grant_id), &grant);

        r.status = RecipientStatus::Disbursed;
        r.verified_at = env.ledger().timestamp();
        r.disbursed_at = env.ledger().timestamp();
        r.verifier = verifier;
        env.storage().persistent().set(&recipient_key(&student_id), &r);

        // EVENT DISBURSE
        env.events().publish(
            (symbol_short!("disb"),),
            (&student_id, &grant.amount_per_recipient)
        );

        s.total_verified += 1;
        s.total_disbursed += grant.amount_per_recipient;
        s.last_updated = env.ledger().timestamp();
        env.storage().instance().set(&STATS_KEY, &s);
        Ok(())
    }

    pub fn get_recipient(env: Env, student_id: String) -> Option<Recipient> {
        env.storage().persistent().get(&recipient_key(&student_id))
    }

    pub fn get_grant(env: Env, grant_id: u64) -> Option<Grant> {
        env.storage().persistent().get(&grant_key(grant_id))
    }

    pub fn get_dashboard_stats(env: Env) -> DashboardStats {
        env.storage().instance().get(&STATS_KEY).unwrap_or(DashboardStats {
            total_grants: 0, total_recipients: 0, total_disbursed: 0,
            total_pending: 0, total_verified: 0, last_updated: 0,
        })
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }

    pub fn is_verifier(env: Env, addr: Address) -> bool {
        env.storage().instance().get(&verifier_key(&addr)).unwrap_or(false)
    }

    pub fn grant_count(env: Env) -> u64 {
        env.storage().instance().get(&GRANT_CNT_KEY).unwrap_or(0)
    }

    pub fn close_grant(env: Env, admin: Address, grant_id: u64) -> Result<(), ScholarError> {
        Self::assert_admin(&env, &admin)?;
        admin.require_auth();
        let mut grant: Grant = env.storage().persistent()
            .get(&grant_key(grant_id)).ok_or(ScholarError::GrantNotFound)?;
        let remaining = grant.total_fund - grant.disbursed_amount;
        if remaining > 0 {
            token::Client::new(&env, &grant.token_address)
                .transfer(&env.current_contract_address(), &grant.sponsor, &remaining);
        }
        grant.is_active = false;
        env.storage().persistent().set(&grant_key(grant_id), &grant);
        Ok(())
    }

    fn assert_admin(env: &Env, caller: &Address) -> Result<(), ScholarError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(ScholarError::NotAuthorized)?;

        if *caller != admin {
            return Err(ScholarError::NotAuthorized);
        }

        Ok(())
    }
}
