package config

import (
	"os"
	"strconv"
)

type Config struct {
	Env         string
	Port        string
	DatabaseURL string

	VoyageAPIKey string

	StripeSecretKey      string
	StripeWebhookSecret  string

	ResendAPIKey    string
	ResendFromEmail string

	// Rate limiting
	RateLimitFreeRPM    int
	RateLimitBuilderRPM int
	RateLimitProRPM     int
	RateLimitAgencyRPM  int
}

func Load() Config {
	return Config{
		Env:         getEnv("ENV", "development"),
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: mustEnv("DATABASE_URL"),

		VoyageAPIKey: mustEnv("VOYAGE_API_KEY"),

		StripeSecretKey:     mustEnv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: mustEnv("STRIPE_WEBHOOK_SECRET"),

		ResendAPIKey:    mustEnv("RESEND_API_KEY"),
		ResendFromEmail: getEnv("RESEND_FROM_EMAIL", "hello@retainr.dev"),

		RateLimitFreeRPM:    getEnvInt("RATE_LIMIT_FREE_RPM", 100),
		RateLimitBuilderRPM: getEnvInt("RATE_LIMIT_BUILDER_RPM", 500),
		RateLimitProRPM:     getEnvInt("RATE_LIMIT_PRO_RPM", 2000),
		RateLimitAgencyRPM:  getEnvInt("RATE_LIMIT_AGENCY_RPM", 5000),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" && os.Getenv("ENV") != "test" {
		panic("required environment variable not set: " + key)
	}
	return v
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
