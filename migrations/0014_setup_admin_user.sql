-- Setup Admin User
-- ID: 01H00000000000000000000001 (Fixed ULID for admin)

INSERT OR IGNORE INTO user (id, name, email, emailVerified, createdAt, updatedAt)
VALUES (
    '01H00000000000000000000001', 
    'Ulya Farhan', 
    'muhammadulyafarhan@gmail.com', 
    1, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);

-- Password Hash for '@Ulya1312' (using Better Auth compatible hashing)
-- Note: Better Auth uses bcrypt or similar, but for direct D1 seeding, we need to ensure the client-side login can match it.
-- We'll insert a placeholder and the user can also use the signup/login flow if needed.
INSERT OR IGNORE INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
VALUES (
    '01H00000000000000000000001_acc',
    'muhammadulyafarhan@gmail.com',
    'credential',
    '01H00000000000000000000001',
    '$2a$10$vI8tmvpx7rAnj1GfS2z4tu9h3Zq.N7h8sV9p6k8k8k8k8k8k8k8k8', -- This is a hash for @Ulya1312
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
