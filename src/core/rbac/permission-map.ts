export const permissionMap = {
  user: {
    view: 'user.view',
    create: 'user.create',
    update: 'user.update',
    delete: 'user.delete',
  },

  role: {
    view: 'role.view',
    create: 'role.create',
    update: 'role.update',
    delete: 'role.delete',
  },
} as const;