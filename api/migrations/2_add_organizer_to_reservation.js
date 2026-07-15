export const up = (pgm) => {
  pgm.addColumn('reservations', {
    organizer: { type: 'text', notNull: true },
  });

  pgm.alterColumn('reservations', 'user_id', { allowNull: true });
};

export const down = (pgm) => {
  pgm.dropColumn('reservations', 'organizer');

  pgm.alterColumn('reservations', 'user_id', { notNull: true });
};
