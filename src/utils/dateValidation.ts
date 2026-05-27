const pad = (value: number) => String(value).padStart(2, "0");

export const todayDateInputValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const todayDateTimeInputValue = () => `${todayDateInputValue()}T00:00`;

export const isBeforeToday = (value?: string | null) => {
  if (!value) return false;
  const selected = new Date(value);
  if (Number.isNaN(selected.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected < today;
};
