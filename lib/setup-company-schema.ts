import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function setupCompanySchema(companySlug: string) {
  const supabase = createClientComponentClient()

  // Create schema if it doesn't exist
  await supabase.rpc("create_company_schema", { schema_name: companySlug })

  // Create tables in the company schema

  // Employees table
  await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS ${companySlug}.employees (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        employment_type VARCHAR(50) NOT NULL,
        hourly_rate DECIMAL(10, 2),
        monthly_salary DECIMAL(10, 2),
        contractual_hours_per_week INTEGER,
        join_date DATE NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  })

  // Payslips table
  await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS ${companySlug}.payslips (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES ${companySlug}.employees(id),
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        payment_date DATE NOT NULL,
        basic_pay DECIMAL(10, 2) NOT NULL,
        allowances JSONB DEFAULT '{}',
        deductions JSONB DEFAULT '{}',
        overtime_hours DECIMAL(10, 2) DEFAULT 0,
        overtime_rate DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  })

  // Work records table
  await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS ${companySlug}.work_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES ${companySlug}.employees(id),
        work_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        break_minutes INTEGER DEFAULT 0,
        is_public_holiday BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  })

  return true
}
