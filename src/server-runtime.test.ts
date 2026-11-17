// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveRuntimeMode,
  shouldExposeResetToken,
  forgotPasswordResponse,
} from "./server-runtime.ts";

const NODE = ["node", "server.ts"];

test("runtime mode defaults to production when nothing is set (plain `npm start`)", () => {
  assert.equal(resolveRuntimeMode({}, NODE), "production");
});

test("runtime mode is production for NODE_ENV=production and for unknown values", () => {
  assert.equal(resolveRuntimeMode({ NODE_ENV: "production" }, NODE), "production");
  assert.equal(resolveRuntimeMode({ NODE_ENV: "staging" }, NODE), "production");
  assert.equal(resolveRuntimeMode({ NODE_ENV: "" }, NODE), "production");
});

test("runtime mode honours explicit development and test settings", () => {
  assert.equal(resolveRuntimeMode({}, [...NODE, "--dev"]), "development");
  assert.equal(resolveRuntimeMode({ NODE_ENV: "development" }, NODE), "development");
  assert.equal(resolveRuntimeMode({ NODE_ENV: " Development " }, NODE), "development");
  assert.equal(resolveRuntimeMode({ NODE_ENV: "test" }, NODE), "test");
});

test("reset token is never exposed in production, even with the opt-in flags", () => {
  const argv = [...NODE, "--expose-reset-token"];
  assert.equal(shouldExposeResetToken("production", { EXPOSE_DEV_RESET_TOKEN: "true" }, argv), false);
});

test("dev mode alone does not expose the reset token", () => {
  assert.equal(shouldExposeResetToken("development", {}, NODE), false);
  assert.equal(shouldExposeResetToken("test", {}, NODE), false);
  assert.equal(shouldExposeResetToken("development", { EXPOSE_DEV_RESET_TOKEN: "1" }, NODE), false);
});

test("dev or test mode plus an explicit opt-in exposes the reset token", () => {
  assert.equal(shouldExposeResetToken("development", {}, [...NODE, "--expose-reset-token"]), true);
  assert.equal(shouldExposeResetToken("test", { EXPOSE_DEV_RESET_TOKEN: "true" }, NODE), true);
  assert.equal(shouldExposeResetToken("development", { EXPOSE_DEV_RESET_TOKEN: "TRUE" }, NODE), true);
});

test("`npm start` (no flags, no env) never exposes the token end to end", () => {
  const mode = resolveRuntimeMode({}, NODE);
  assert.equal(shouldExposeResetToken(mode, {}, NODE), false);
});

test("`npm run dev` (--dev --expose-reset-token) keeps the local reset shortcut", () => {
  const argv = [...NODE, "--dev", "--expose-reset-token"];
  const mode = resolveRuntimeMode({}, argv);
  assert.equal(mode, "development");
  assert.equal(shouldExposeResetToken(mode, {}, argv), true);
});

test("forgot-password response omits the token unless exposure is allowed", () => {
  assert.deepEqual(forgotPasswordResponse("abc123", false), { success: true });
  assert.deepEqual(forgotPasswordResponse(null, false), { success: true });
  assert.deepEqual(forgotPasswordResponse(null, true), { success: true });
  assert.deepEqual(forgotPasswordResponse("abc123", true), { success: true, _devToken: "abc123" });
});
