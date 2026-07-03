import postgres from 'postgres';

// Ensure DATABASE_URL is available
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL environment variable is not defined.");
}

// Establish a single database client instance for the Next.js process lifecycle
const sql = postgres(connectionString || '', {
  // Use require for Supabase database connections to guarantee encrypted channels
  ssl: 'require',
  // Connection timeout in seconds
  connect_timeout: 10,
  // Automatically close connections that have been idle for more than 10 seconds
  idle_timeout: 10,
});

export default sql;
