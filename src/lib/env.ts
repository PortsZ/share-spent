import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  AWS_S3_BUCKET: z.string().min(1).optional(),
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
});

const getRawEnv = () => ({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
});

const parsedEnv = EnvSchema.safeParse(getRawEnv());

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.flatten();
  const firstMessage = formattedErrors.formErrors[0];
  throw new Error(firstMessage ?? "Invalid environment configuration");
}

export const env = parsedEnv.data;

export const isDevelopment = env.NODE_ENV === "development";

/**
 * Feature availability, resolved from what is actually configured rather than
 * from NODE_ENV. Reading these lets a deployment boot with partial config and
 * degrade, instead of failing the build.
 */
export const isClerkConfigured = Boolean(
  env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export const isDatabaseConfigured = Boolean(env.DATABASE_URL);

export const isStorageConfigured = Boolean(
  env.AWS_S3_BUCKET &&
    env.AWS_REGION &&
    env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY,
);

export const isAiConfigured = Boolean(env.OPENAI_API_KEY);

const REQUIRED_FOR_FULL_APP = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "OPENAI_API_KEY",
  "AWS_S3_BUCKET",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
] as const satisfies ReadonlyArray<keyof typeof env>;

export const missingEnvKeys = () =>
  REQUIRED_FOR_FULL_APP.filter((key) => !env[key]);

/**
 * Call this from the code path that actually needs full configuration, so a
 * missing secret surfaces where it is used. Throwing at module load instead
 * turns any missing variable into a build failure, which is what kept this
 * app from deploying.
 */
export const assertFullyConfigured = () => {
  const missing = missingEnvKeys();

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};
