import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const passwordUtils = {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  },

  isPasswordStrong(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(password);
  },
};
