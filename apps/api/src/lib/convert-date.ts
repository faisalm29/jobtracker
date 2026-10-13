export const convertDate = (value: string | Date) => {
  return value instanceof Date ? value : new Date(value);
};
