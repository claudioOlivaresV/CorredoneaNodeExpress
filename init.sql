-- =========================================
-- ROLES
-- =========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true
);


-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role_id INTEGER NOT NULL,

    active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
);


-- =========================================
-- PROPERTIES
-- =========================================

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,

    address VARCHAR(255) NOT NULL,

    description TEXT,

    monthly_rent DECIMAL(12,2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',

    agent_id INTEGER,

    client_id INTEGER,

    rental_start_date DATE,

    rental_end_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_agent
        FOREIGN KEY (agent_id)
        REFERENCES users(id),

    CONSTRAINT fk_property_client
        FOREIGN KEY (client_id)
        REFERENCES users(id),

    CONSTRAINT chk_property_status
        CHECK (
            status IN (
                'AVAILABLE',
                'RENTED',
                'MAINTENANCE'
            )
        ),

    CONSTRAINT chk_monthly_rent
        CHECK (monthly_rent >= 0),

    CONSTRAINT chk_rental_dates
        CHECK (
            rental_end_date IS NULL
            OR rental_start_date IS NULL
            OR rental_end_date >= rental_start_date
        )
);


-- =========================================
-- UN CLIENTE SOLO PUEDE TENER UNA PROPIEDAD
-- =========================================

CREATE UNIQUE INDEX unique_client_property
ON properties(client_id)
WHERE client_id IS NOT NULL;


-- =========================================
-- PAYMENTS
-- =========================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    property_id INTEGER NOT NULL,

    due_date DATE NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    paid_at TIMESTAMP,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_payment_status
        CHECK (
            status IN (
                'PENDING',
                'PAID',
                'OVERDUE'
            )
        ),

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0)
);


-- =========================================
-- ROLES INICIALES
-- =========================================

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'Administrador del sistema'),
    ('AGENTE', 'Agente inmobiliario'),
    ('CLIENTE', 'Cliente de la corredora');