export const cabins = {
  lake: { name: 'The Lake House', nightly: 195, guests: 2, dogs: false },
  woodland: { name: 'The Woodland Suite', nightly: 245, guests: 4, dogs: true },
};
export function localDate(date = new Date()) {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}
export function calculateStay(
  { cabin, arrival, departure, guests, dog },
  today = localDate(),
) {
  if (!cabins[cabin]) return { error: 'Choose one of our places.' };
  if (
    !arrival ||
    !departure ||
    !/^\d{4}-\d{2}-\d{2}$/.test(arrival) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(departure)
  )
    return { error: 'Choose your arrival and departure dates.' };
  const start = Date.parse(arrival + 'T12:00:00Z');
  const end = Date.parse(departure + 'T12:00:00Z');
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    new Date(start).toISOString().slice(0, 10) !== arrival ||
    new Date(end).toISOString().slice(0, 10) !== departure
  )
    return { error: 'Choose valid calendar dates.' };
  if (arrival < today)
    return { error: 'Your arrival needs to be today or later.' };
  const nights = Math.round((end - start) / 86400000);
  if (nights < 2)
    return {
      error: 'Give yourself a little time: our minimum stay is two nights.',
    };
  if (nights > 21)
    return { error: 'The stay planner supports a maximum of 21 nights.' };
  const selected = cabins[cabin];
  if (
    !Number.isInteger(Number(guests)) ||
    Number(guests) < 1 ||
    Number(guests) > selected.guests
  )
    return {
      error: selected.name + ' welcomes up to ' + selected.guests + ' guests.',
    };
  if (dog && !selected.dogs)
    return {
      error:
        'Dogs are welcome in the Woodland Suite. The Lake House is pet-free.',
    };
  return {
    nights,
    total: nights * selected.nightly + (dog ? 25 : 0),
    nightly: selected.nightly,
    dogFee: dog ? 25 : 0,
  };
}
