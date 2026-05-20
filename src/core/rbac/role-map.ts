export const roleMap: Record<string, { name: string; permissions: string[] }> = {
  super_admin: {
    name: 'Super Admin',
    permissions: ['*'],
  },

  admin: {
    name: 'Admin',
    permissions: [
      'user.index',
      'user.show',
      'user.create',
      'user.update',

      'role.index',
      'role.show',

      'permission.index',
      'permission.show',
    ],
  },

  user: {
    name: 'User',
    permissions: [
      'user.index',
      'user.show',
    ],
  },
} as const;