import assert from "node:assert/strict";
import { describe, it } from "node:test";

const DEV_PATTERNS = [
  /anna@creator\.io/i,
  /password123/i,
  /demo123456/i,
  /demo@creatorpulse\.local/i,
  /dev test/i,
  /dev-тест/i,
  /test account/i,
  /demo account/i,
  /Anna Creator/i,
  /Anna Petrova/i,
];

function assertNoDevCopy(value: string, label: string) {
  for (const pattern of DEV_PATTERNS) {
    assert.doesNotMatch(
      value,
      pattern,
      `${label} must not match ${pattern}`
    );
  }
}

describe("auth UI production copy", () => {
  it("uses neutral login and register placeholders", async () => {
    const { ru } = await import("@/lib/i18n/ru");
    const { en } = await import("@/lib/i18n/en");

    assert.equal(ru.login.emailPlaceholder, "name@example.com");
    assert.equal(en.login.emailPlaceholder, "name@example.com");
    assert.equal(ru.login.passwordPlaceholder, "Введите пароль");
    assert.equal(en.login.passwordPlaceholder, "Enter your password");
    assert.equal(ru.register.emailPlaceholder, "name@example.com");
    assert.equal(en.register.emailPlaceholder, "name@example.com");
  });

  it("does not expose dev or seed strings in auth copy", async () => {
    const { ru } = await import("@/lib/i18n/ru");
    const { en } = await import("@/lib/i18n/en");

    for (const dict of [ru, en]) {
      const authStrings = [
        dict.login.signInToView,
        dict.login.signInDesc,
        dict.login.emailPlaceholder,
        dict.login.passwordPlaceholder,
        dict.login.headline1,
        dict.login.description,
        dict.register.title,
        dict.register.desc,
        dict.register.emailPlaceholder,
        dict.register.passwordPlaceholder,
        dict.register.confirmPasswordPlaceholder,
        dict.register.namePlaceholder,
      ];

      for (const value of authStrings) {
        assertNoDevCopy(value, value);
      }

      assert.doesNotMatch(String(dict.login.signInDesc), /аналитик/i);
    }
  });
});
