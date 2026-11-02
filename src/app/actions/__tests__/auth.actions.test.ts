// __tests__/auth.actions.test.ts
import { loginAction, registerAction } from "../auth.actions";
import { signIn } from "next-auth/react";
import * as userService from "@/services/user.service";
import { hash } from "bcryptjs";

// Mock FormData
class MockFormData {
  private data: Record<string, string> = {};
  constructor(initial?: Record<string, string>) {
    if (initial) this.data = initial;
  }
  get(key: string) {
    return this.data[key] ?? null;
  }
}

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/services/user.service", () => ({
  userService: {
    createUser: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("auth.actions server functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginAction", () => {
    it("should return success when signIn succeeds", async () => {
      (signIn as jest.Mock).mockResolvedValue({ error: undefined });
      const form = new MockFormData({ email: "user@example.com", password: "secret" });
      const result = await loginAction(form as any);
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "user@example.com",
        password: "secret",
        redirect: false,
      });
      expect(result).toEqual({ success: true });
    });

    it("should return error when signIn fails", async () => {
      (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });
      const form = new MockFormData({ email: "bad@example.com", password: "wrong" });
      const result = await loginAction(form as any);
      expect(result).toEqual({ error: "Invalid credentials" });
    });
  });

  describe("registerAction", () => {
    it("should create user and auto‑login on success", async () => {
      (hash as jest.Mock).mockResolvedValue("hashedpw");
      (userService.createUser as jest.Mock).mockResolvedValue(undefined);
      (signIn as jest.Mock).mockResolvedValue({ error: undefined });

      const form = new MockFormData({ name: "John", email: "john@example.com", password: "pwd123" });
      const result = await registerAction(form as any);

      expect(hash).toHaveBeenCalledWith("pwd123", 10);
      expect(userService.createUser).toHaveBeenCalledWith("John", "john@example.com", "hashedpw");
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "john@example.com",
        password: "pwd123",
        redirect: false,
      });
      expect(result).toEqual({ success: true });
    });

    it("should return error when userService.createUser throws", async () => {
      (hash as jest.Mock).mockResolvedValue("hashedpw");
      (userService.createUser as jest.Mock).mockRejectedValue(new Error("DB error"));

      const form = new MockFormData({ name: "Jane", email: "jane@example.com", password: "pwd456" });
      const result = await registerAction(form as any);
      expect(result).toEqual({ error: "DB error" });
    });
  });
});
