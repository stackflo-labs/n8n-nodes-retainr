-- +goose Up
-- +goose StatementBegin
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS signup_attribution JSONB;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE workspaces DROP COLUMN IF EXISTS signup_attribution;
-- +goose StatementEnd
