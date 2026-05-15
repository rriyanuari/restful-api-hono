export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  return await Bun.password.verify(hash, password);
}