// Package apikeys provides API key generation and hashing for retainr platform products.
package apikeys

import (
	"crypto/rand"
	"math/big"

	"github.com/alexedwards/argon2id"
)

const base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

// Generate creates a new API key in rec_live_<base58> format.
// Returns the raw key (shown once to user), its argon2id hash, and the 12-char lookup prefix.
func Generate() (raw, hash, prefix string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return
	}

	raw = "rec_live_" + base58Encode(b)
	prefix = raw[:12]

	hash, err = argon2id.CreateHash(raw, argon2id.DefaultParams)
	return
}

// Verify checks whether rawKey matches hash.
func Verify(rawKey, hash string) (bool, error) {
	return argon2id.ComparePasswordAndHash(rawKey, hash)
}

func base58Encode(b []byte) string {
	n := new(big.Int).SetBytes(b)
	zero := big.NewInt(0)
	mod := new(big.Int)
	radix := big.NewInt(58)

	var result []byte
	for n.Cmp(zero) > 0 {
		n.DivMod(n, radix, mod)
		result = append([]byte{base58Alphabet[mod.Int64()]}, result...)
	}
	for _, byt := range b {
		if byt != 0 {
			break
		}
		result = append([]byte{base58Alphabet[0]}, result...)
	}
	return string(result)
}
